# 01 - 系統架構與 Service Adapter 設計規範

> **目標**：規範 Fred's POS 前端的代碼架構、目錄組織，以及 UI 與資料存取徹底解耦的 **Service Adapter 模式**。

---

## 1. 目錄結構規範 (Project Structure)

實作 AI 必須遵循清晰的分層架構，禁止將所有代碼堆疊在單一目錄下。

```text
src/
├── assets/                  # 靜態資源、圖示、樣式
├── components/              # 共通 UI 元件 (通用、無特定業務邏輯)
│   ├── common/              # 按鈕、輸入框、徽章、模態彈窗 (Modal)、分頁
│   ├── layout/              # 頂部狀態列 (Header)、側邊導航 (Sidebar)、主佈局 (MainLayout)
│   └── feedback/            # Toast 提示、Loading Spinner、確認對話框
├── features/                # 業務功能模組 (按核心領域劃分)
│   ├── checkout/            # 出單 / 結帳櫃檯
│   │   ├── components/      # 購物車清單、改價彈窗、帶入預購抽屜、組合支付面板
│   │   └── hooks/           # useCart, useCheckout, useBarcodeScanner
│   ├── inventory/           # 商品及庫存管理
│   │   ├── components/      # 商品表格、多地點庫存檢視、調撥彈窗、商品建檔表單
│   │   └── hooks/           # useProductList, useStockTransfer
│   └── customers/           # 客戶會員
│       ├── components/      # 客戶詳情卡、未結預購單表格、消費歷史紀錄
│       └── hooks/           # useCustomerSearch
├── services/                # 領域服務層 (DDD Service Layer)
│   ├── interfaces/          # 核心 Service 介面定義 (IProductService 等)
│   ├── mock/                # Mock 實作 (LocalStorage 驅動，未來抽換為 HTTP)
│   │   ├── mockDataSeed.ts  # 初始示範資料種子 (商品、預訂單、客戶、歷史結帳單)
│   │   ├── storageHelper.ts # LocalStorage 讀寫與版本控管工具
│   │   ├── mockProductService.ts
│   │   ├── mockCheckoutService.ts
│   │   ├── mockPreOrderService.ts
│   │   └── mockCustomerService.ts
│   └── index.ts             # 服務注入點 (統一導出單例 Service 實例)
├── store/                   # 全域狀態管理 (Zustand)
│   ├── cartStore.ts         # 當前結帳櫃檯購物車狀態
│   ├── uiStore.ts           # 側邊欄開合、當前選中視圖、全域 Modal 狀態
│   └── sessionStore.ts      # 門市資訊、當前登入店員、班次資訊
├── types/                   # 領域模型型別定義 (對應 02 號文件)
│   ├── product.ts
│   ├── inventory.ts         # 庫存調撥請求等跨實體型別
│   ├── preorder.ts
│   ├── checkout.ts
│   └── customer.ts
└── utils/                   # 工具函式
    ├── currency.ts          # 貨幣與找零精確計算
    ├── skuNormalizer.ts     # 貨號去 Dash 模糊搜尋演算法
    └── date.ts              # 日期時間格式化
```

---

## 2. Service Adapter 模式 (核心解耦機制)

為了讓未來後端（Python FastAPI）上線時能夠無縫對接，**UI 元件與 Hook 嚴禁直接呼叫 `localStorage` 或寫死假資料**，必須透過抽象介面層。

> ⚠️ **API 契約同步原則 (OpenAPI Sync)**：
> **實作前端程式（包括 Service 介面、資料型別與 Mock 實作）的同時，必須將用到的 API 更新到 `docs/` 資料夾裡的 `openapi.yaml`**。
> 任何前端新增或變更的 API 呼叫、路徑、Query 參數、Payload 結構與 Response 型別，均須同步反映在 `docs/openapi.yaml` 中，確保前後端規格始終對齊。

### 2.1 介面定義規範 (`src/services/interfaces/`)

所有服務均回傳 `Promise<T>`，以確保非同步特性與未來真實網路請求一致：

```typescript
// src/services/interfaces/IProductService.ts
import { Product, ProductSearchParams } from '@/types/product';
import {
  InventoryTransferRequest,
  StockAdjustRequest,
  BatchStockAdjustRequest,
  StockAdjustmentLog,
} from '@/types/inventory';

export interface IProductService {
  /** 模糊搜尋商品 (支援條碼、貨號無 dash 比對、車型名稱) */
  searchProducts(params: ProductSearchParams): Promise<Product[]>;
  /** 依 ID 取得單一商品 */
  getProductById(id: string): Promise<Product | null>;
  /** 新增商品建檔 */
  createProduct(product: Omit<Product, 'id' | 'totalStock' | 'preOrderPendingCount' | 'normalizedSku'>): Promise<Product>;
  /** 跨據點庫存調撥 (門市/倉庫/公司) */
  transferStock(request: InventoryTransferRequest): Promise<boolean>;
  /** 手動單一調整庫存數量 */
  adjustStock(request: StockAdjustRequest): Promise<boolean>;
  /** 批量調整庫存數量並紀錄操作日誌 */
  batchAdjustStock(request: BatchStockAdjustRequest): Promise<boolean>;
  /** 取得庫存操作歷史日誌 */
  getStockAdjustmentLogs(): Promise<StockAdjustmentLog[]>;
}

```

```typescript
// src/services/interfaces/ICheckoutService.ts
import { CheckoutOrder, CreateOrderPayload, CheckoutReceipt } from '@/types/checkout';

export interface ICheckoutService {
  /** 建立結帳單並扣減庫存、更新預購單、累計會員點數 */
  createCheckoutOrder(payload: CreateOrderPayload): Promise<CheckoutReceipt>;
  /** 查詢歷史結帳單 */
  getOrderHistory(customerId?: string): Promise<CheckoutOrder[]>;
  /** 作廢 / 退換貨訂單處理 */
  refundOrder(orderId: string, reason: string): Promise<boolean>;
}
```

```typescript
// src/services/interfaces/IPreOrderService.ts
import { PreOrder } from '@/types/preorder';

export interface IPreOrderService {
  /** 依客戶電話或單號搜尋未結預購單 */
  getPendingPreOrders(query: string): Promise<PreOrder[]>;
  /** 沖銷預購單數量 (在結帳完成時調用) */
  fulfillPreOrderItems(preOrderId: string, fulfilledItems: { productId: string; qty: number }[]): Promise<boolean>;
  /** 建立新預購單 */
  createPreOrder(preOrder: Partial<PreOrder>): Promise<PreOrder>;
  /** [Phase 2] 標記預購品項到貨數量（更新 qtyArrived） */
  markItemsArrived?(preOrderId: string, arrivedItems: { productId: string; qty: number }[]): Promise<boolean>;
}
```

```typescript
// src/services/interfaces/ICustomerService.ts
import { Customer } from '@/types/customer';

export interface ICustomerService {
  /** 依電話、姓名或關鍵字搜尋會員 */
  searchCustomers(query: string): Promise<Customer[]>;
  /** 依 ID 取得單一會員 */
  getCustomerById(id: string): Promise<Customer | null>;
  /** 依電話精確查詢（結帳櫃檯綁定會員用） */
  getCustomerByPhone(phone: string): Promise<Customer | null>;
  /** 新增會員 */
  createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer>;
  /** 更新會員點數與累計消費（結帳後由 CheckoutService 內部調用） */
  updateCustomerSpending(customerId: string, amount: number, earnedPoints: number): Promise<boolean>;
}
```

---

## 3. Mock 服務實作規範 (`src/services/mock/`)

1. **模擬網路延遲**：
   封裝輔助函式 `simulateDelay(minMs = 80, maxMs = 180)`，在每次 CRUD 前 `await`，模擬微小網路請求時間，讓 UI 的 Loading 與動畫更加逼真。
2. **LocalStorage 永續化機制**：
   - 系統第一次啟動時，檢查 `localStorage.getItem('FREDS_POS_INITIALIZED')`。
   - 若為空，則載入 `mockDataSeed.ts` 中的模型車原始種子資料（含 `INITIAL_ORDERS`），並寫入 LocalStorage。
   - 提供全域 `resetDemoData()` 函式，清除 LocalStorage 並重新寫入預設示範資料。
3. **資料一致性 (Transactional Emulation)**：
   - 當 `createCheckoutOrder` 執行時，必須在 Mock 內部**同步扣減對應商品的庫存**。
   - 若該品項關聯 `preOrderId`，必須**同步扣減預購單的未取數量**，並將預購單狀態依情況更新為 `partially_completed` 或 `completed`。
   - 這能確保業主在結帳完畢後，切換到「商品及庫存」或「客戶會員」頁面時，能親眼看見數據已被即時更新！

### 3.1 狀態持久化策略 (Persistence Strategy)

| 資料類型 | 持久化方式 | localStorage Key 範例 | 備註 |
| :--- | :--- | :--- | :--- |
| 商品、預購單、客戶、歷史結帳單 | Service → `storageHelper` | `FREDS_POS_PRODUCTS`、`FREDS_POS_ORDERS` 等 | 首次啟動寫入 seed |
| 購物車 (`cartStore`) | Zustand `persist` middleware | `FREDS_POS_CART` | refresh 後購物車不遺失 |
| 門市 / 店員 (`sessionStore`) | Zustand `persist` middleware | `FREDS_POS_SESSION` | 固定示範用店員資訊 |
| UI 暫態 (`uiStore`) | **不持久化** | — | Modal 開合、當前編輯品項等 |
| 初始化旗標 | `storageHelper` | `FREDS_POS_INITIALIZED` | 判斷是否已載入 seed |
| Schema 版本 | `storageHelper` | `FREDS_POS_SCHEMA_VERSION` | 版本不符時自動 reset seed |

**`cartStore` 持久化實作要求**：

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    { name: 'FREDS_POS_CART' }
  )
);
```

**localStorage 損壞處理**：若 `JSON.parse` 失敗，呼叫 `resetDemoData()` 還原 seed，並以 Toast 提示「示範資料已自動還原」。

---

## 4. 全域狀態管理 (Zustand Stores)

狀態管理精準劃分為以下 Store：

### 4.1 `cartStore`（結帳櫃檯購物車核心狀態）

> 必須使用 `zustand/middleware` 的 `persist` 持久化（見 §3.1），確保 refresh 後購物車內容不遺失。
```typescript
interface CartItem {
  productId: string;
  sku: string;
  name: string;
  scale: string;
  brand: string;
  originalPrice: number;    // 原定價
  unitPrice: number;        // 當前單價 (可能被手動修改)
  isManualPrice: boolean;   // 是否手動改價過
  priceChangeReason?: string;
  quantity: number;         // 購買數量 (支援負數退貨，如 -1)
  preOrderId?: string;      // 若來自預購單取貨，記錄預購單號
  preOrderItemId?: string;
}

interface CartStore {
  items: CartItem[];
  attachedCustomer: Customer | null;
  shippingFee: number;
  orderNote: string;
  // 操作方法
  addItem: (product: Product, qty?: number) => void;
  importPreOrderItem: (preOrder: PreOrder, item: PreOrderItem, qty: number) => void;
  updateItemQuantity: (productId: string, newQty: number) => void;
  updateItemPrice: (productId: string, newPrice: number, reason?: string) => void;
  removeItem: (productId: string) => void;
  attachCustomer: (customer: Customer | null) => void;
  setShippingFee: (fee: number) => void;
  clearCart: () => void;
  // 計算屬性 Getters
  getSubtotal: () => number;
  getTotalAmount: () => number;
  getTotalItemsCount: () => number;
}
```

### 4.2 `uiStore`（介面互動狀態）
- `activeTab`: `'checkout' | 'inventory' | 'customers'`
- `isPreOrderDrawerOpen`: boolean
- `isManualPriceModalOpen`: boolean
- `isPaymentModalOpen`: boolean
- `isStockTransferModalOpen`: boolean
- `isProductCreateModalOpen`: boolean
- `currentEditingCartItem`: CartItem | null

---

## 5. 服務匯出單例 (`src/services/index.ts`)

```typescript
import { MockProductService } from './mock/mockProductService';
import { MockCheckoutService } from './mock/mockCheckoutService';
import { MockPreOrderService } from './mock/mockPreOrderService';
import { MockCustomerService } from './mock/mockCustomerService';

// 目前使用 Mock 實作，未來只需在此替換為 HttpProductService
export const productService = new MockProductService();
export const checkoutService = new MockCheckoutService();
export const preOrderService = new MockPreOrderService();
export const customerService = new MockCustomerService();
```
這樣設計保證了所有 UI 元件只需要 `import { checkoutService } from '@/services'`，將實現徹底封裝。
