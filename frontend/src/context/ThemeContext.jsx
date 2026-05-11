import React, { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// Using 'v2' key so existing users with 'light' saved get a fresh start with dark default
const THEME_KEY = 'taskteam_theme_v2';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage(THEME_KEY, 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
