import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

type ThemeMode = "light" | "dark";
type ThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth() ?? {};
  // 1. Try localStorage first
  const getInitialMode = (): ThemeMode => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.settings?.theme === "dark" || parsed?.settings?.theme === "light") {
        return parsed.settings.theme;
      }
    }
    return "light";
  };

  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  // 2. Update mode if user preference changes (from backend)
  useEffect(() => {
    if (user?.settings?.theme === "dark" || user?.settings?.theme === "light") {
      setMode(user.settings.theme);
    }
  }, [user]);

  const toggleTheme = () => setMode((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};