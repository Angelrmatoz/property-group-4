import React from "react";
import { render, screen, act } from "@testing-library/react";
import {
  NotificationProvider,
  useNotification,
} from "@/components/Notification";

function TestComponent() {
  const { notify } = useNotification();
  return (
    <div>
      <button data-testid="notify-success" onClick={() => notify({ type: "success", message: "Success!" })}>
        Success
      </button>
      <button data-testid="notify-error" onClick={() => notify({ type: "error", message: "Error!", title: "Error Title" })}>
        Error
      </button>
      <button data-testid="notify-info" onClick={() => notify({ type: "info", message: "Info message" })}>
        Info
      </button>
      <button data-testid="notify-default" onClick={() => notify({ message: "Default toast" })}>
        Default
      </button>
    </div>
  );
}

describe("Notification", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders without crashing", () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    expect(screen.getByTestId("notify-success")).toBeInTheDocument();
  });

  it("throws error when useNotification is used outside provider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      "useNotification must be used within NotificationProvider"
    );
    consoleError.mockRestore();
  });

  it("shows success toast on success click", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    await act(async () => {
      screen.getByTestId("notify-success").click();
    });
    expect(await screen.findByText("Success!")).toBeInTheDocument();
  });

  it("shows error toast with title on error click", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    await act(async () => {
      screen.getByTestId("notify-error").click();
    });
    expect(await screen.findByText("Error Title")).toBeInTheDocument();
    expect(screen.getByText("Error!")).toBeInTheDocument();
  });

  it("shows info toast", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    await act(async () => {
      screen.getByTestId("notify-info").click();
    });
    expect(await screen.findByText("Info message")).toBeInTheDocument();
  });

  it("auto-dismisses toast after duration", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    await act(async () => {
      screen.getByTestId("notify-default").click();
    });
    expect(await screen.findByText("Default toast")).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.queryByText("Default toast")).not.toBeInTheDocument();
  });

  it("allows dismissing toast by clicking close", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    await act(async () => {
      screen.getByTestId("notify-success").click();
    });
    expect(await screen.findByText("Success!")).toBeInTheDocument();
    await act(async () => {
      const closeBtn = screen.getByRole("button", { name: /cerrar/i });
      closeBtn.click();
    });
    expect(screen.queryByText("Success!")).not.toBeInTheDocument();
  });

  it("shows multiple toasts stacked", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    await act(async () => {
      screen.getByTestId("notify-success").click();
      screen.getByTestId("notify-error").click();
      screen.getByTestId("notify-info").click();
    });
    expect(await screen.findByText("Success!")).toBeInTheDocument();
    expect(screen.getByText("Error!")).toBeInTheDocument();
    expect(screen.getByText("Info message")).toBeInTheDocument();
  });

  it("toast has correct role=status attribute", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    await act(async () => {
      screen.getByTestId("notify-info").click();
    });
    const toast = await screen.findByText("Info message");
    expect(toast.closest('[role="status"]')).toBeInTheDocument();
  });
});
