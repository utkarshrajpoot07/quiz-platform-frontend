import React, { createContext, useContext, useState } from "react";

// Create Context
export const ThemeContext = createContext();

// Provider Component
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode((prev) => !prev);

    // Add/remove class on body for global dark mode
    if (!darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ---------------
// CUSTOM HOOK (This was missing)
// ---------------
export const useTheme = () => {
  return useContext(ThemeContext);
};