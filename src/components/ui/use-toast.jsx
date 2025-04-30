import * as React from "react";
const ToastContext = React.createContext();

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const toast = React.useCallback(
    ({ title, description, status = "default", duration = 5000 }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, title, description, status, duration },
      ]);
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
      }, duration);
      return id;
    },
    []
  );

  const value = React.useMemo(() => ({ toast, toasts }), [toast, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`rounded-lg p-4 shadow-md ${
                t.status === "success"
                  ? "bg-green-500 text-white"
                  : t.status === "error"
                  ? "bg-red-500 text-white"
                  : t.status === "warning"
                  ? "bg-yellow-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {t.title && <h4 className="font-bold">{t.title}</h4>}
              {t.description && <p>{t.description}</p>}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}


export { ToastProvider, useToast };
