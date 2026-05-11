"use client";

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationProvider } from "@/components/Notification";
import { useRouter } from "next/navigation";
import Login from "@/app/login/page";
import authService from "@/services/auth";
import * as tokenStorage from "@/lib/token-storage";

// Mock dependencies
jest.mock("@/services/auth");
jest.mock("@/lib/token-storage");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Type-safe mocks
const mockAuth = authService as jest.Mocked<typeof authService>;
const mockToken = tokenStorage as jest.Mocked<typeof tokenStorage>;
const mockUseRouter = useRouter as jest.Mock;

describe("Login Integration", () => {
  let pushMock: jest.Mock;
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    pushMock = jest.fn();
    mockUseRouter.mockReturnValue({ push: pushMock });
    
    // Default mock implementation
    mockToken.hasValidAuthToken.mockReturnValue(false);
  });

  const renderLogin = () => {
    return render(
      <NotificationProvider>
        <Login />
      </NotificationProvider>
    );
  };

  it("renders form fields using accessible roles", () => {
    renderLogin();
    
    expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /recuérdame/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("completes a successful login flow", async () => {
    mockAuth.login.mockResolvedValue({
      ok: true,
      token: "valid-token",
      user: { id: "1", firstName: "Test", lastName: "User", email: "test@example.com" },
    });

    renderLogin();

    // Use user-event for realistic interaction
    await user.type(screen.getByRole("textbox", { name: /email/i }), "test@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "password123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockAuth.login).toHaveBeenCalledWith("test@example.com", "password123", false);
    });
    
    expect(mockToken.storeAuthToken).toHaveBeenCalledWith("valid-token", false);
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("handles 'remember me' preference", async () => {
    mockAuth.login.mockResolvedValue({
      ok: true,
      token: "persistent-token",
    });

    renderLogin();

    await user.type(screen.getByRole("textbox", { name: /email/i }), "admin@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "admin123");
    await user.click(screen.getByRole("checkbox", { name: /recuérdame/i }));
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockAuth.login).toHaveBeenCalledWith("admin@example.com", "admin123", true);
    });
    
    expect(mockToken.storeAuthToken).toHaveBeenCalledWith("persistent-token", true);
  });

  it("shows error notification on failed login", async () => {
    mockAuth.login.mockResolvedValue({
      ok: false,
      message: "Credenciales incorrectas",
    });

    renderLogin();

    await user.type(screen.getByRole("textbox", { name: /email/i }), "wrong@test.com");
    await user.type(screen.getByLabelText(/contraseña/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    // Verify error notification appears
    // Since we wrapped in NotificationProvider, we check for the text
    expect(await screen.findByText(/credenciales incorrectas/i)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("redirects automatically if already logged in with rememberMe", () => {
    mockToken.hasValidAuthToken.mockReturnValue(true);
    mockToken.isRememberMeEnabled.mockReturnValue(true);

    renderLogin();

    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("clears token if logged in without rememberMe (session reset)", () => {
    mockToken.hasValidAuthToken.mockReturnValue(true);
    mockToken.isRememberMeEnabled.mockReturnValue(false);

    renderLogin();

    expect(mockToken.clearAuthToken).toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
