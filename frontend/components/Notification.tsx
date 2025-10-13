"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type NotificationType = "success" | "error" | "info";

type Notification = {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // ms
};

type NotifyParams = Omit<Notification, "id">;

type NotificationContextValue = {
  notify: (p: NotifyParams) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Notification[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback(
    (p: NotifyParams) => {
      const id = `${Date.now()}_${counter.current++}`;
      const n: Notification = {
        id,
        type: p.type ?? "info",
        title: p.title,
        message: p.message,
        duration: p.duration ?? 4000,
      };
      setToasts((t) => [n, ...t]);

      if (n.duration && n.duration > 0) {
        setTimeout(() => remove(id), n.duration);
      }
    },
    [remove]
  );

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-0 z-50 flex items-end sm:items-start md:items-start sm:justify-end md:justify-end p-4"
      >
        <div className="w-full max-w-xs sm:max-w-sm flex flex-col gap-2">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onClose={() => remove(t.id)} />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
}

function Toast({
  type,
  title,
  message,
  onClose,
}: Omit<Notification, "id"> & { onClose: () => void }) {
  // color mapping
  const base = "pointer-events-auto rounded-lg p-3 shadow-md border";
  const colorMap: Record<NotificationType, string> = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    info: "bg-slate-900 text-white border-slate-700",
  };

  const cls = `${base} ${colorMap[type]}`;

  return (
    <div className={cls} role="status">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && <div className="font-semibold text-sm mb-1">{title}</div>}
          <div className="text-sm leading-snug">{message}</div>
        </div>
        <div className="flex-shrink-0 self-start">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationProvider;
