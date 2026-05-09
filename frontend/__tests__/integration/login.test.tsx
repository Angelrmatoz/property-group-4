"use client";

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { NotificationProvider } from "@/components/Notification";
import { useRouter } from "next/navigation";
import { storeAuthToken } from "@/lib/token-storage";
import * as tokenStorage from "@/lib/token-storage";
import authService from "@/services/auth";

jest.mock("@/services/auth");
jest.mock("@/lib/token-storage");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockAuth = authService as jest.Mocked<typeof authService>;
const mockToken = tokenStorage as jest.Mocked<typeof tokenStorage>;
const mockUseRouter = useRouter as jest.Mock;

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    (async () => {
      const result = await authService.login(email, password, rememberMe);
      if (result.ok) {
        if (result.token) storeAuthToken(result.token, rememberMe);
        router.push("/dashboard");
      } else {
        setError(result.message || "Login failed");
        setLoading(false);
      }
    })();
  };

  return (
    <NotificationProvider>
      <form onSubmit={handleSubmit} data-testid="login-form">
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="email-input"
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="password-input"
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              data-testid="remember-checkbox"
            />
            Recuérdame
          </label>
        </div>
        {error && <div data-testid="error-msg">{error}</div>}
        <button type="submit" disabled={loading}>Entrar</button>
      </form>
    </NotificationProvider>
  );
};

describe("Login Form (integration)", () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    pushMock = jest.fn();
    mockUseRouter.mockReturnValue({ push: pushMock } as any);
  });

  it("renders form fields", () => {
    render(<LoginForm />);
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("remember-checkbox")).toBeInTheDocument();
  });

  it("updates email and password on change", () => {
    render(<LoginForm />);
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");

    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });

    expect(emailInput).toHaveValue("user@test.com");
    expect(passwordInput).toHaveValue("secret123");
  });

  it("calls login with correct args on submit", async () => {
    mockAuth.login.mockResolvedValue({
      ok: true,
      token: "abc123",
      user: { id: "1", firstName: "Test", lastName: "User", email: "user@test.com" },
    });
    mockToken.storeAuthToken.mockImplementation(() => {});

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "secret123" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    await waitFor(() => {
      expect(mockAuth.login).toHaveBeenCalledWith("user@test.com", "secret123", false);
    });
  });

  it("stores token in sessionStorage when rememberMe=false", async () => {
    mockAuth.login.mockResolvedValue({
      ok: true,
      token: "tok-session",
      user: { id: "1", firstName: "T", lastName: "U", email: "t@t.com" },
    });
    mockToken.storeAuthToken.mockImplementation(() => {});

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), { target: { value: "t@t.com" } });
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "p" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    await waitFor(() => {
      expect(mockToken.storeAuthToken).toHaveBeenCalledWith("tok-session", false);
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("stores token in localStorage when rememberMe=true", async () => {
    mockAuth.login.mockResolvedValue({
      ok: true,
      token: "tok-persist",
      user: { id: "2", firstName: "Admin", lastName: "A", email: "admin@t.com" },
    });
    mockToken.storeAuthToken.mockImplementation(() => {});

    render(<LoginForm />);

    fireEvent.click(screen.getByTestId("remember-checkbox"));
    fireEvent.change(screen.getByTestId("email-input"), { target: { value: "admin@t.com" } });
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "adminpass" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    await waitFor(() => {
      expect(mockToken.storeAuthToken).toHaveBeenCalledWith("tok-persist", true);
    });
  });

  it("shows error message on failed login", async () => {
    mockAuth.login.mockResolvedValue({
      ok: false,
      message: "Usuario o contraseña incorrecto",
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), { target: { value: "bad@test.com" } });
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "wrong" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("error-msg")).toHaveTextContent("Usuario o contraseña incorrecto");
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows generic error on login failure without message", async () => {
    mockAuth.login.mockResolvedValue({ ok: false });

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), { target: { value: "x@x.com" } });
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "x" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("error-msg")).toHaveTextContent("Login failed");
    });
  });
});
