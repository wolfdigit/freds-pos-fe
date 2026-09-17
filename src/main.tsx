import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { useThemeStore, applyTheme } from './store/themeStore';

// 確保初始渲染時正確套用主題 class
applyTheme(useThemeStore.getState().theme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
