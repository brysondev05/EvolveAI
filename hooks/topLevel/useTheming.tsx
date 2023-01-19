import { useState } from 'react';
import { DarkTheme } from '@react-navigation/native';
export const useTheming = () => {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return {
    fontsLoaded: true,
    toggleTheme,
    theme,
    navigationTheme: DarkTheme,
  };
};
