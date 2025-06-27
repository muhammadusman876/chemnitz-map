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

// Updated color palette
const customColors = {
  primary: {
    main: 'rgb(3, 166, 161)', // Teal
    light: 'rgb(77, 182, 172)', // Light teal
    dark: 'rgb(0, 121, 107)', // Dark teal
  },
  secondary: {
    main: 'rgb(255, 79, 15)', // Orange
    light: 'rgb(255, 166, 115)', // Light orange
    dark: 'rgb(230, 70, 10)', // Dark orange
  },
  tertiary: {
    main: 'rgb(255, 227, 187)', // Cream
    light: 'rgb(255, 240, 220)', // Lighter cream
    dark: 'rgb(240, 210, 160)', // Darker cream
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
      ...(mode === 'light'
        ? {
          // Light mode
          background: {
            default: 'rgb(255, 227, 187)', // Cream background
            paper: '#ffffff',
          },
          text: {
            primary: 'rgb(37, 47, 63)', // Dark gray text
            secondary: 'rgba(37, 47, 63, 0.7)',
          },
        }
        : {
          // Dark mode
          background: {
            default: 'rgb(37, 47, 63)', // Dark background
            paper: 'rgba(37, 47, 63, 0.9)',
          },
          text: {
            primary: 'rgb(255, 227, 187)', // Light text
            secondary: 'rgba(255, 227, 187, 0.7)',
          },
        }),
    },
    components: {
      // Customize button styles
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
          },
          contained: {
            background: customColors.primary.main,
            color: 'white',
            boxShadow: '0 3px 15px 2px rgba(3, 166, 161, 0.3)',
            '&:hover': {
              background: customColors.primary.dark,
              boxShadow: '0 5px 20px 3px rgba(3, 166, 161, 0.4)',
            },
          },
          outlined: {
            borderColor: customColors.primary.main,
            color: customColors.primary.main,
            '&:hover': {
              borderColor: customColors.primary.dark,
              background: 'rgba(3, 166, 161, 0.1)',
            },
          },
        },
      },
      // Customize chip styles
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          filled: {
            background: customColors.primary.main,
            color: 'white',
            fontWeight: 600,
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
            borderRadius: 16,
            backdropFilter: 'blur(10px)',
          },
        },
      },
      // Customize AppBar (navbar) - no gradient
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: customColors.primary.main,
            boxShadow: '0 2px 10px rgba(3, 166, 161, 0.2)',
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