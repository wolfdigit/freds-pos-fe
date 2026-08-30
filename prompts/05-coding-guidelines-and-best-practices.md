# 05 - 代碼工程規範與最佳實踐 (Best Practices)

> **目標**：規範實作 AI 在編寫 Fred's POS 前端時必須嚴格遵守的代碼工程規範、組件劃分原則、貨幣計算安全防呆與鍵盤快速鍵人體工學。

---

## 1. 嚴禁反模式 (Anti-Patterns to Avoid)

實作 AI 必須杜絕以下常見不良習慣：

1. **嚴禁單檔巨型組件 (No Monolithic Components)**：
   - 單一 `.tsx` 檔案大小**不得超過 250 行**。
   - 頁面若有複合功能，必須拆解為：主容器 (`FeaturePage.tsx`)、子視圖 (`FeatureSubView.tsx`)、彈窗 (`FeatureModal.tsx`) 與自訂 Hook (`useFeature.ts`)。
2. **嚴禁在 UI 組件中寫死 Mock 資料或直接操作 `localStorage`**：
   - 所有的資料存取都必須透過 `src/services/index.ts` 導出的 Service 實例。
3. **嚴禁濫用 `any` 型別**：
   - 100% 嚴格 TypeScript 型別覆蓋，所有 Props、Store Action、Service 回傳值均必須明確定義型別。
4. **嚴禁將所有狀態塞入單一巨大的全域 Store**：
   - 僅共用資料放置於 Zustand Store（如購物車、當前登入者）。
   - 純 UI 內部彈窗開合、表單即時暫存等，應使用局部 `useState` 或局部 Hook。
5. **嚴禁忽視 API 契約同步 (No Stale OpenAPI Specs)**：
   - 實作或調整前端功能時，嚴禁僅修改前端 Service/Types 而未同步更新 API 文件。
   - 任何涉及前後端資料交換之端點、請求結構、回應格式變更，必須同步更新至 `docs/openapi.yaml`。
6. **嚴禁在假資料/示範資料中使用真實人名 (No Real Personal Names)**：
   - 假資料、Seed 資料或 UI 範例中不得出現真實人名，一律使用完全虛構之名稱、代號或通用稱呼（如「極速模型工作室」、「王大同」、「範例客戶」）。
7. **嚴禁在 build 後清除 `dist/` (Keep dist/ in VCS)**：
   - 執行 `npm run build` 編譯產生的 `dist/` 是專案需要納入版本控制 (Git) 的成果物，**不需要也不得將 `dist/` 清掉**，應保持完整並一起 push 進版本管理中。
8. **規格與 Prompts 必須同步更新 (Always Sync Prompts Documentation)**：
   - 任何涉及**畫面佈局 (Screens)**、**操作動線 (User Flow)**、**業務邏輯 (Business Rules)**、**UI 規範**或**核心 Store 架構**的改動，在實作的同時必須一併更新 `prompts/` 內對應的規格文件（如 `03-screens-and-ui-specs.md`、`04-business-flows-and-state-machines.md`），杜絕代碼與規格脫鉤。

---

## 2. 元件職責劃分 (Container vs. Presentational)

遵循「邏輯與外觀分離」原則：

```text
features/checkout/
├── components/
│   ├── CartTable.tsx           # 純展示：接收 items, onUpdateQty, onRemove
│   ├── CartItemRow.tsx         # 單列呈現：商品資訊、改價徽章、按鈕
│   ├── PriceOverrideModal.tsx  # 改價專用輕量彈窗
│   ├── PreOrderImportDrawer.tsx# 預購抽屜專用面板
│   └── PaymentModal.tsx        # 組合支付與找零彈窗
├── hooks/
│   ├── useCartOperations.ts    # 封裝購物車計算與改價邏輯
│   ├── useBarcodeListener.ts   # 全域監聽條碼槍輸入 (Enter 結尾)
│   └── useCheckoutWorkflow.ts  # 結帳單建立與列印調用
└── CheckoutPage.tsx            # 主容器，組裝上述元件，負責外觀排版
```

---

## 3. 金額精準計算防呆規範 (`src/utils/currency.ts`)

JavaScript 原生浮點數計算存在經典問題（例：`0.1 + 0.2 === 0.30000000000000004`），在收銀系統中是嚴重的致命錯誤。

### 3.1 貨幣計算 Utility 實作要求

```typescript
// src/utils/currency.ts

/**
 * 格式化為新台幣整數顯示，例如: NT$ 7,200
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return 'NT$ 0';
  return `NT$ ${Math.round(amount).toLocaleString('zh-TW')}`;
}

/**
 * 安全金額累加，防止浮點數誤差
 */
export function safeAdd(...numbers: number[]): number {
  return Math.round(numbers.reduce((acc, cur) => acc + (cur || 0), 0));
}

/**
 * 計算找零金額 (實收 - 應付)
 */
export function calculateChange(tendered: number, totalDue: number): {
  isSufficient: boolean;
  changeAmount: number;
  shortageAmount: number;
} {
  const diff = Math.round(tendered - totalDue);
  return {
    isSufficient: diff >= 0,
    changeAmount: Math.max(0, diff),
    shortageAmount: Math.max(0, -diff),
  };
}
```

---

## 4. POS 人體工學與鍵盤快速鍵 (Keyboard & Touch Ergonomics)

實體門市店員講求速度，手不離鍵盤即可完成一整筆交易。

### 4.1 全域快速鍵規範 (`src/features/checkout/hooks/useKeyboardShortcuts.ts`)
- **`F2` 或 `/`**：將游標自動聚焦至商品搜尋輸入框，並全選內容。
- **`F4`**：直接開啟「快速帶入未結預購單」抽屜。
- **`F9` 或 `Space` (在購物車非輸入狀態下)**：直接開啟「付款與結帳」視窗。
- **`ESC`**：關閉目前任何開啟的彈窗或抽屜，返回主結帳畫面。
- **`Enter`**：在搜尋下拉列表中選中第一個匹配商品並加入購物車。

### 4.2 條碼掃描槍 (Barcode Scanner) 支援
USB / 藍芽條碼槍實質上為鍵盤模擬輸入設備（快速輸入一串數字後自動觸發 `Enter` 鍵）。
- 實作自訂 Hook `useBarcodeScanner(onBarcodeScan: (barcode: string) => void)`。
- 當系統偵測到小於 50ms 間隔的連續鍵盤輸入且以 `Enter` 結尾時，判斷為條碼槍掃描，自動觸發加入購物車流程。

---

## 5. 錯誤與空狀態處理 (Empty & Loading States)

1. **搜尋無結果**：
   - 不可只留下空白畫面；必須顯示友善暗色卡片：「找不到符合條件的模型車，請檢查貨號或條碼」，並附帶快速按鈕 `[新增此商品建檔]`。
2. **購物車空狀態**：
   - 顯示精緻的空購物車插圖或圖示，提示「目前無待結品項，請使用上方搜尋框或掃描條碼加入商品」。
3. **資料重置確認**：
   - 點擊「重置示範資料」時，必須彈出二次確認對話框，避免展示時不小心誤觸清除。
4. **Service 業務錯誤**：
   - 統一使用 `BusinessError`（見 `04` §7），以 Toast 元件呈現，**禁止** `alert()` 或 `console.error` 代替使用者提示。
5. **localStorage 損壞**：
   - `storageHelper` 讀取失敗時自動呼叫 `resetDemoData()`，並 Toast 提示「示範資料已自動還原」。

---

## 6. 業主 Demo 展示腳本 (Demo Walkthrough)

以下為固定示範流程，種子資料與 UI 行為應確保可依序順利操作：

### 情境 A — 散客現場購買 + 手動改價

```
1. 結帳櫃檯（預設首頁）
2. 搜尋「AA79121」或「79121」→ 選中 AutoArt GT-R R34
3. 點擊 [✎ 手動改價] → 輸入 $7,000，原因「老闆特批」
4. F9 開啟結帳 → 選現金 → 點 [$8,000] 快捷面額
5. 確認結帳 → 檢視收據預覽（應找零 $1,000）
```

### 情境 B — 預購客戶部分取貨

```
1. F4 開啟預購抽屜
2. 輸入電話「0912345678」→ 帶出陳冠宇
3. 展開 PO-202607-0019 → R34 本次領取 1 台 → [帶入結帳清單]
4. 確認購物車顯示 [預購取貨] 徽章，單價 $6,900
5. 刷卡結帳 → 完成後至客戶會員頁確認預購單狀態變為 partially_completed
```

### 情境 C — 庫存調撥後結帳

```
1. 切換至「商品及庫存」
2. 搜尋 MC-155021020（BMW M3 E30，門市現貨 0、倉庫 1）
3. [調撥] 倉庫 → 門市，數量 1
4. 切回結帳櫃檯 → 搜尋該商品 → 加入購物車 → 完成結帳
```

### 情境 D — 客戶歷史紀錄與補印收據

```
1. 切換至「客戶會員」
2. 選擇「極速模型工作室」→ 分頁 B「歷史結帳紀錄」
3. 點擊 SO-20260818-0063 → [補印收據] → 檢視組合支付明細
```

### 固定 Demo 測試資料速查

| 用途 | 電話 / 貨號 / 單號 |
| :--- | :--- |
| 部分到貨預購客戶 | 電話 `0912345678`（陳冠宇） |
| 未到貨預購客戶 | 電話 `0988765432`（林俊宏） |
| 已部分領取預購客戶 | 電話 `0933112233`（極速模型工作室） |
| 門市缺貨需調撥 | 貨號 `MC-155021020` |
| 去 Dash 搜尋測試 | 輸入 `AA79121` 應匹配 `AA-79121` |

---

## 7. 命名規範補充 (Naming Conventions)

- UI 中文文案與程式碼識別符對照，以 `04` §0 命名對照表為準。
- Store action 使用動詞開頭：`addItem`、`importPreOrderItem`、`attachCustomer`。
- Modal / Drawer 元件以功能命名：`PaymentModal`、`PreOrderImportDrawer`（不用 `Modal1`、`Drawer2`）。
- Service 方法回傳 `Promise`，命名用 `get*` / `create*` / `search*` 前綴。
- `PaymentMethodType` 的 `'cod'` 保留於型別但不實作 UI，避免與結帳櫃檯的 `createCheckoutOrder` 混淆。

---

## 8. API 規格同步規範 (OpenAPI Contract Maintenance)

為了確保未來 Python FastAPI 後端能與前端無縫接軌：

1. **同步時機**：
   - 在前端新增 Service 方法、定義新 Request/Response 型別，或調整現有 API 呼叫欄位時，**必須於同一任務/提交中將用到的 API 更新至 `docs/openapi.yaml`**。
2. **更新範圍**：
   - **Paths & Operations**：路徑 (如 `/products`, `/checkout/orders`)、HTTP 方法 (`GET`, `POST`, `PATCH` 等) 及 `operationId`。
   - **Parameters**：Query, Path 或 Header 參數名稱與型別。
   - **Request Body & Schemas**：Payload 欄位與結構 (於 `components/schemas` 內維護)。
   - **Response Schemas & Status Codes**：成功回應 (`200`, `201`) 與 `BusinessError` 錯誤代碼說明。
3. **驗證要求**：
   - 更新後請確保 YAML 語法正確，避免 indentation 錯誤破壞規格檔。
