import toast from "react-hot-toast";

export const showSuccessToast = (
  message: string,
  theme: "light" | "dark" = "dark"
) => {
  return toast.success(message, {
    style: {
      borderRadius: "10px",
      background: theme === "dark" ? "#10B981" : "#059669",
      color: "#fff",
      fontWeight: "500",
      padding: "16px",
      boxShadow:
        theme === "dark"
          ? "0 4px 12px rgba(0, 0, 0, 0.25)"
          : "0 4px 12px rgba(16, 185, 129, 0.25)",
    },
    iconTheme: {
      primary: "#fff",
      secondary: theme === "dark" ? "#10B981" : "#059669",
    },
    duration: 4000,
  });
};

export const showErrorToast = (
  message: string,
  theme: "light" | "dark" = "dark"
) => {
  return toast.error(message, {
    style: {
      borderRadius: "10px",
      background: theme === "dark" ? "#EF4444" : "#DC2626",
      color: "#fff",
      fontWeight: "500",
      padding: "16px",
      boxShadow:
        theme === "dark"
          ? "0 4px 12px rgba(0, 0, 0, 0.25)"
          : "0 4px 12px rgba(239, 68, 68, 0.25)",
    },
    iconTheme: {
      primary: "#fff",
      secondary: theme === "dark" ? "#EF4444" : "#DC2626",
    },
    duration: 5000,
  });
};

export const showLoadingToast = (
  message: string,
  theme: "light" | "dark" = "dark"
) => {
  return toast.loading(message, {
    style: {
      borderRadius: "10px",
      background: theme === "dark" ? "#374151" : "#6B7280",
      color: "#fff",
      fontWeight: "500",
      padding: "16px",
      boxShadow:
        theme === "dark"
          ? "0 4px 12px rgba(0, 0, 0, 0.25)"
          : "0 4px 12px rgba(107, 114, 128, 0.25)",
    },
    iconTheme: {
      primary: "#fff",
      secondary: theme === "dark" ? "#3B82F6" : "#2563EB",
    },
  });
};
