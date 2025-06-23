import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#FFA673" },
    background: { default: "#f8fafc", paper: "#fff" },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#FF4F0F" },
    background: { default: "#18181b", paper: "#23232a" },
  },
});
