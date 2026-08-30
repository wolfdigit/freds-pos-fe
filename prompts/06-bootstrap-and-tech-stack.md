# 06 - 專案建置與技術堆疊規範 (Bootstrap & Tech Stack)

> **目標**：提供從零開始建置 Fred's POS 前端 Mockup 的明確技術起點，避免實作 AI 自行選用不一致的框架版本或目錄結構。

---

## 1. 技術堆疊 (固定選型)

| 類別 | 選型 | 版本建議 |
| :--- | :--- | :--- |
| 建置工具 | Vite | ^6.x |
| UI 框架 | React | ^18.3 或 ^19.x |
| 語言 | TypeScript | ^5.x |
| 樣式 | Tailwind CSS | ^3.4 |
| 狀態管理 | Zustand (+ `persist` middleware) | ^5.x |
| 路徑別名 | `@/` → `src/` | 透過 `vite.config.ts` + `tsconfig.json` |
| 工具函式 | `clsx` + `tailwind-merge` | 選用，用於條件 class 合併 |

**Mockup 階段明確不做**：
- 真實後端 API 串接
- 使用者登入 / 權限驗證流程
- 熱感應印表機驅動或實體列印
- PWA / 離線 Service Worker
- 單元測試框架（除非後續另行要求）

---

## 2. 初始化指令 (Scaffold Commands)

實作 AI 應依下列順序建立專案：

```bash
# 1. 建立 Vite + React + TypeScript 專案
npm create vite@latest . -- --template react-ts

# 2. 安裝核心依賴
npm install zustand clsx tailwind-merge

# 3. 安裝 Tailwind CSS 及開發依賴
npm install -D tailwindcss postcss autoprefixer

# 4. 安裝 Node 型別宣告（vite.config.ts 會用到 path / __dirname，缺此套件會編譯錯誤）
npm install -D @types/node

npx tailwindcss init -p

# 5. 啟動開發伺服器
npm run dev

# 6. 建置生產版本 (若需要)
npm run build
```

驗收標準：瀏覽器可開啟 `http://localhost:5173`，終端機零 TypeScript 錯誤。

> ⚠️ **建置產物版本管理規範 (`dist/` VCS Policy)**：
> 若執行 `npm run build` 產生 `dist/`，**不需要也不得將 `dist/` 清掉**。專案設定與工作流程中，必須將編譯產出的 `dist/` 資料夾一同提交並 push 進版本管理 (Git) 中。因此 `.gitignore` 不得忽略 `dist/`。

---

## 3. 必要設定檔

### 3.1 `vite.config.ts` — 路徑別名

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3.2 `tsconfig.json` — 對應 paths

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

若專案採用 `tsconfig.app.json` + `tsconfig.node.json` 分離架構（Vite 官方 react-ts 範本的預設做法），`tsconfig.node.json` 需額外加上 `"types": ["node"]`，否則 `vite.config.ts` 裡的 `path.resolve(__dirname, ...)` 會出現 `Cannot find module 'path'` / `Cannot find name '__dirname'` 的型別錯誤。

### 3.3 `tailwind.config.js` — 暗色主題

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // 預設 html 加上 class="dark"
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

### 3.4 `src/index.css` — Tailwind 入口

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-zinc-950 text-zinc-200 antialiased;
}
```

> ⚠️ 注意：`dark` 在 `darkMode: 'class'` 設定下只是給 `dark:` 前綴變體用的標記，**並不是一個可被 `@apply` 的工具類別**。切勿寫 `html { @apply dark; }`，這會導致 `vite build` 直接失敗（`The 'dark' class does not exist`）。暗色模式完全靠下方 §3.5 在 `<html>` 標籤上直接寫 `class="dark"` 達成即可。

### 3.5 `index.html` — 預設暗色模式

```html
<html lang="zh-TW" class="dark">
```

---

## 4. 應用程式入口結構

```text
src/
├── main.tsx              # ReactDOM.createRoot，掛載 <App />
├── App.tsx               # 組裝 <MainLayout />，讀取 uiStore.activeTab 切換視圖
├── components/layout/    # Header, Sidebar, MainLayout
├── features/             # checkout, inventory, customers（見 01 號文件）
├── services/             # Service Adapter 層
├── store/                # Zustand stores（含 persist）
├── types/                # 領域型別
└── utils/                # currency, skuNormalizer, date
```

**視圖切換方式**：使用 `uiStore.activeTab`（`'checkout' | 'inventory' | 'customers'`）在 `App.tsx` 內條件渲染，**Mockup 階段不需引入 `react-router-dom`**。

---

## 5. 最小螢幕與裝置假設

- 目標裝置：店內桌面螢幕或橫向平板（收銀櫃檯）
- 建議最小寬度：`min-width: 1280px`
- **不需** mobile-first 響應式設計；小螢幕可顯示橫向捲動提示即可

---

## 6. 與其他規格文件的關係

| 本文件負責 | 其他文件負責 |
| :--- | :--- |
| 技術選型、初始化、Tailwind 設定 | `01` — 目錄結構、Service Adapter、持久化策略、OpenAPI 契約同步 |
| 路徑別名、入口結構 | `02` — 領域型別與種子資料 |
| Mockup 階段邊界（不做什麼） | `03`~`05` — UI、業務邏輯、工程規範、`docs/openapi.yaml` 同步規範 |
