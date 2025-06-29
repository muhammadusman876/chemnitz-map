import React, { createContext, useContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useAuth } from "../hooks/useAuth";

type ThemeMode = "light" | "dark";
type ThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleTheme: () => { },
});

export const useThemeMode = () => useContext(ThemeContext);

// Modern, clean color palette
const customColors = {
  primary: {
    main: '#2563eb', // Modern blue
    light: '#3b82f6',
    dark: '#1d4ed8',
  },
  secondary: {
    main: '#8b5cf6', // Purple
    light: '#a78bfa',
    dark: '#7c3aed',
  },
  success: {
    main: '#10b981', // Green
    light: '#34d399',
    dark: '#059669',
  },
  error: {
    main: '#ef4444', // Red
    light: '#f87171',
    dark: '#dc2626',
  },
  warning: {
    main: '#f59e0b', // Amber
    light: '#fbbf24',
    dark: '#d97706',
  },
};

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth() ?? {};

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

  useEffect(() => {
    if (user?.settings?.theme === "dark" || user?.settings?.theme === "light") {
      setMode(user.settings.theme);
    }
  }, [user]);

  const toggleTheme = () => setMode((prev) => (prev === "dark" ? "light" : "dark"));

  // Create custom theme
  const theme = createTheme({
    palette: {
      mode,
      primary: customColors.primary,
      secondary: customColors.secondary,
      success: customColors.success,
      error: customColors.error,
      warning: customColors.warning,
      ...(mode === 'light'
        ? {
          // Light mode - Clean and modern
          background: {
            default: '#f8fafc', // Very light gray
            paper: '#ffffff',
          },
          text: {
            primary: '#0f172a', // Almost black
            secondary: '#64748b', // Medium gray
          },
          divider: '#e2e8f0',
        }
        : {
          // Dark mode - Deep black
          background: {
            default: '#121212', // Dark black
            paper: 'rgba(18, 18, 18, 0.95)', // Your specified black color
          },
          text: {
            primary: '#f1f5f9', // Almost white
            secondary: '#94a3b8', // Light gray
          },
          divider: '#333333', // Darker divider for black theme
        }),
    },
    components: {
      // Customize button styles
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 20px',
          },
          contained: {
            background: customColors.primary.main,
            color: 'white',
            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
            '&:hover': {
              background: customColors.primary.dark,
              boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.35)',
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderColor: customColors.primary.main,
            color: customColors.primary.main,
            '&:hover': {
              borderColor: customColors.primary.dark,
              background: mode === 'light'
                ? 'rgba(37, 99, 235, 0.05)'
                : 'rgba(37, 99, 235, 0.1)',
            },
          },
        },
      },
      // Customize chip styles
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
          filled: {
            background: customColors.primary.main,
            color: 'white',
            '&:hover': {
              background: customColors.primary.dark,
            },
          },
        },
      },
      // Customize paper styles
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backdropFilter: 'blur(10px)',
            border: mode === 'light'
              ? '1px solid rgba(226, 232, 240, 0.8)'
              : '1px solid rgba(51, 65, 85, 0.8)',
          },
        },
      },
      // Customize AppBar (navbar)
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            border: 0,
            background: mode === 'light'
              ? '#ffffff'
              : 'rgba(18, 18, 18, 0.95)', // Use your black color for AppBar too
            color: mode === 'light'
              ? '#0f172a'
              : '#f1f5f9',
            boxShadow: mode === 'light'
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      // Customize Card
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light'
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};