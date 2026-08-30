# 02 - 領域模型與模型車 Mock 資料集規範

> **目標**：規範 Fred's POS 專用的 TypeScript 領域模型（符合 DDD Aggregate / Entity）以及專門為模型車實體門市量身定制的逼真示範資料集。

---

## 1. 領域模型 TypeScript 型別定義 (`src/types/`)

### 1.1 商品實體 (`src/types/product.ts`)

```typescript
export type ModelScale = '1:18' | '1:43' | '1:64' | '1:24' | '1:12' | '配件周邊';

export type StockLocation = 'store' | 'warehouse' | 'company' | 'other';

export interface LocationStock {
  location: StockLocation;
  locationName: string; // '門市現貨' | '後方倉庫' | '公司調度' | '其他'
  quantity: number;
}

export interface Product {
  id: string;
  sku: string;               // 貨號 (例如: AA-79121, SP-S7682)
  normalizedSku: string;     // 去 dash 貨號 (例如: AA79121，用於比對)
  barcode: string;           // 國際條碼 (例如: 4534530079121)
  brand: string;             // 品牌/廠牌 (例如: AutoArt, Spark, Inno64, TLV)
  name: string;              // 品名/車型 (例如: Nissan Skyline GT-R R34 V-Spec II)
  scale: ModelScale;         // 比例
  material?: string;         // 材質 (合金 Diecast / 樹脂 Resin)
  color?: string;            // 塗裝顏色 (例如: Bayside Blue)
  imageUrl?: string;         // 商品縮圖 (庫存表與 Autocomplete 卡片顯示；無圖時顯示比例徽章佔位)
  listPrice: number;         // 門市定價
  costPrice: number;         // 成本價 (老闆與店長視圖)
  vipPrice?: number;         // 會員專屬優惠價
  stocks: LocationStock[];   // 各地點庫存明細
  totalStock: number;        // 現貨總庫存
  preOrderPendingCount: number; // 預購未交數量 (統計欄位)
  note?: string;             // 備註說明
  status: 'active' | 'discontinued';
}

export interface ProductSearchParams {
  keyword?: string;          // 關鍵字 (貨號/條碼/品名)
  scale?: ModelScale | 'ALL';
  brand?: string | 'ALL';
  inStockOnly?: boolean;     // 僅顯示有現貨
}
```

### 1.2 庫存調撥型別 (`src/types/inventory.ts`)

```typescript
import { StockLocation } from './product';

/** 跨據點庫存調撥請求 */
export interface InventoryTransferRequest {
  productId: string;
  fromLocation: StockLocation;
  toLocation: StockLocation;
  quantity: number;
  reason?: string;           // 調撥原因備註
  operatorId?: string;       // 操作店員 ID
}

/** 手動調整庫存請求 */
export interface StockAdjustRequest {
  productId: string;
  location: StockLocation;
  newQuantity: number;
  reason: string;
}

export interface StockLocationChange {
  location: StockLocation;
  locationName: string;
  oldQty: number;
  newQty: number;
  diff: number;
}

export interface StockItemAdjustment {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  changes: StockLocationChange[];
  summaryText: string;
}

export interface BatchStockAdjustRequest {
  adjustments: StockItemAdjustment[];
  operatorName: string;
  timestamp: string;
  note?: string;
}

export interface StockAdjustmentLog {
  id: string;
  timestamp: string;
  operatorName: string;
  items: StockItemAdjustment[];
  totalQtyChange: number;
  note?: string;
}
```


### 1.3 預訂單實體 (`src/types/preorder.ts`)

```typescript
export type PreOrderStatus = 
  | 'pending'              // 全品項尚未到貨 (所有品項 qtyArrived = 0)
  | 'partially_arrived'    // 至少一項已到貨、尚未全數領取完畢（含「全到貨但未領」情境）
  | 'partially_completed'  // 客人已領取部分，尚有剩餘項目
  | 'completed'            // 全部已取貨完成結案
  | 'cancelled';           // 已取消

export interface PreOrderItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  scale: ModelScale;
  brand: string;
  quotedPrice: number;     // 預購當時報價
  qtyOrdered: number;      // 客戶下訂數量
  qtyArrived: number;      // 門市已到貨數量
  qtyDelivered: number;    // 客人已結帳領取數量
  // 計算得出：可領取數 = qtyArrived - qtyDelivered
  // 計算得出：未到貨數 = qtyOrdered - qtyArrived
}

export interface PreOrder {
  id: string;
  orderNumber: string;     // 預訂單號 (例如: PO-20260815-001)
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderDate: string;       // 下訂日期
  expectedArrivalDate?: string; // 預計到貨時間
  status: PreOrderStatus;
  source: 'in_store' | 'website'; // 來源：門市臨櫃 / 官網匯入
  items: PreOrderItem[];
  note?: string;
  updatedAt: string;
}
```

### 1.4 結帳單實體 (`src/types/checkout.ts`)

```typescript
// Mockup 階段 UI 僅實作：cash | credit_card | line_pay | bank_transfer
// 'cod'（取貨付款）保留於型別供未來官網訂單匯入，結帳彈窗不顯示此選項
export type PaymentMethodType = 'cash' | 'credit_card' | 'line_pay' | 'bank_transfer' | 'cod';

export interface PaymentTender {
  type: PaymentMethodType;
  name: string;            // '現金' | '信用卡' | 'LINE Pay' | '銀行轉帳' | '取貨付款'
  amount: number;          // 支付金額
  tenderedCash?: number;   // 若為現金，顧客實際給予鈔票金額 (例: 給 2000)
  changeAmount?: number;   // 找零金額 (例: 找 350)
  transactionRef?: string; // 信用卡末四碼 / 轉帳末五碼
}

export interface InvoiceInfo {
  type: 'none' | 'carrier' | 'tax_id' | 'paper';
  carrierCode?: string;    // 手機載具條碼 (例: /ABC+123)
  taxId?: string;          // 統一編號 (8 碼)
  buyerTitle?: string;     // 發票抬頭 (例: 極速模型工作室)
}

export interface CheckoutOrderItem {
  productId: string;
  sku: string;
  name: string;
  scale: ModelScale;
  originalPrice: number;   // 原牌價
  unitPrice: number;       // 實際成交單價
  isManualPrice: boolean;  // 是否為店員手動改價
  priceDiffReason?: string;
  quantity: number;        // 銷售數量 (負數代表瑕疵退換貨)
  subtotal: number;        // unitPrice * quantity
  preOrderId?: string;     // 關聯預購單號 (若為預購取貨)
  preOrderItemId?: string;
}

export interface CheckoutOrder {
  id: string;
  orderNumber: string;     // 結帳單號 (例如: SO-20260830-0088)
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: CheckoutOrderItem[];
  itemsSubtotal: number;
  discountAmount: number;  // 優惠折抵
  shippingFee: number;     // 運費 (若寄送)
  totalAmount: number;     // 應收總額
  payments: PaymentTender[]; // 支援多元/組合支付
  invoice: InvoiceInfo;
  earnedPoints: number;    // 本次新增點數
  usedPoints: number;      // 本次折抵點數
  note?: string;
  createdAt: string;
}

export interface CreateOrderPayload {
  customerId?: string;
  items: CheckoutOrderItem[];
  shippingFee: number;
  payments: PaymentTender[];
  invoice: InvoiceInfo;
  note?: string;
}

export interface CheckoutReceipt {
  order: CheckoutOrder;
  receiptPrintHtml: string; // 產出的熱感應列印票據預覽 HTML
}
```

### 1.5 客戶會員實體 (`src/types/customer.ts`)

```typescript
export type VipTier = 'regular' | 'silver' | 'gold' | 'platinum';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vipTier: VipTier;
  vipTierName: string;     // '一般會員' | '銀卡' | '金卡 (95折)' | '白金黑卡 (9折)'
  rewardPoints: number;    // 點數餘額
  totalSpent: number;      // 累積消費總額
  note?: string;
  createdAt: string;
}
```

---

## 2. 模型車專屬 Mock 資料集種子 (`src/services/mock/mockDataSeed.ts`)

為了讓業主審查時有真實門市的操作體驗，預置以下高品質模型車資料：

為了讓業主審查時有真實門市的操作體驗，預置 **18 筆**高品質模型車資料，涵蓋各比例、零庫存、僅倉庫有貨等情境。商品縮圖使用 `imageUrl` 欄位；若無圖片資源，UI 以比例徽章佔位。

### 2.1 商品資料庫 (含 1:18, 1:43, 1:64 等知名廠牌)

```typescript
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'AA-79121',
    normalizedSku: 'AA79121',
    barcode: '4534530079121',
    brand: 'AutoArt',
    name: 'Nissan Skyline GT-R (R34) V-Spec II 灣岸藍',
    scale: '1:18',
    material: '全開合金 (Composite Diecast)',
    color: 'Bayside Blue',
    imageUrl: '/images/products/prod-001.webp',
    listPrice: 7200,
    costPrice: 4800,
    vipPrice: 6840,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 2 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 5 },
      { location: 'company', locationName: '公司總倉', quantity: 10 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 17,
    preOrderPendingCount: 3,
    note: '熱銷神物，門市架上陳列 1 台',
    status: 'active'
  },
  {
    id: 'prod-002',
    sku: 'SP-S7682',
    normalizedSku: 'SPS7682',
    barcode: '9580006976826',
    brand: 'Spark',
    name: 'Porsche 911 GT3 R #911 Manthey EMA 2024 紐柏林冠軍',
    scale: '1:43',
    material: '樹脂模型 (Resin)',
    color: 'Grello 黃綠塗裝',
    imageUrl: '/images/products/prod-002.webp',
    listPrice: 2850,
    costPrice: 1900,
    vipPrice: 2700,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 1 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 2 },
      { location: 'company', locationName: '公司總倉', quantity: 4 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 7,
    preOrderPendingCount: 2,
    note: '精緻水貼細節，限量附壓克力展示盒',
    status: 'active'
  },
  {
    id: 'prod-003',
    sku: 'INNO-64-FD2-W',
    normalizedSku: 'INNO64FD2W',
    barcode: '4897070184421',
    brand: 'Inno64',
    name: 'Honda Civic Type-R (FD2) 冠軍白 碳纖引擎蓋特仕版',
    scale: '1:64',
    material: '合金壓鑄',
    color: 'Championship White',
    imageUrl: '/images/products/prod-003.webp',
    listPrice: 650,
    costPrice: 420,
    vipPrice: 620,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 6 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 12 },
      { location: 'company', locationName: '公司總倉', quantity: 24 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 42,
    preOrderPendingCount: 0,
    note: '附備用輪圈與水貼紙',
    status: 'active'
  },
  {
    id: 'prod-004',
    sku: 'TLV-N234a',
    normalizedSku: 'TLVN234A',
    barcode: '4543736315248',
    brand: 'Tomica Limited Vintage',
    name: 'Mazda RX-7 Type RS (FD3S) 1999 經典雲母藍',
    scale: '1:64',
    material: '合金壓鑄',
    color: 'Innocent Blue Mica',
    imageUrl: '/images/products/prod-004.webp',
    listPrice: 880,
    costPrice: 580,
    vipPrice: 830,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 3 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 0 },
      { location: 'company', locationName: '公司總倉', quantity: 8 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 11,
    preOrderPendingCount: 1,
    note: 'TLV 玩家必備款',
    status: 'active'
  },
  {
    id: 'prod-005',
    sku: 'MC-155021020',
    normalizedSku: 'MC155021020',
    barcode: '4012138166547',
    brand: 'Minichamps',
    name: 'BMW M3 (E30) 1987 競技黑',
    scale: '1:18',
    material: '合金開門版',
    color: 'Diamantschwarz Metallic',
    imageUrl: '/images/products/prod-005.webp',
    listPrice: 5400,
    costPrice: 3600,
    vipPrice: 5130,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 0 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 1 },
      { location: 'company', locationName: '公司總倉', quantity: 3 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 4,
    preOrderPendingCount: 1,
    note: '門市現貨已售罄，需從倉庫調撥',
    status: 'active'
  },
  {
    id: 'prod-006',
    sku: 'MGT-00555',
    normalizedSku: 'MGT00555',
    barcode: '4892442005551',
    brand: 'Mini GT',
    name: 'Nissan GT-R NISMO GT3 #23 2024 富士速彈',
    scale: '1:64',
    material: '合金壓鑄',
    color: 'Ultimate Metal Silver',
    imageUrl: '/images/products/prod-006.webp',
    listPrice: 580,
    costPrice: 380,
    vipPrice: 550,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 4 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 8 },
      { location: 'company', locationName: '公司總倉', quantity: 0 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 12,
    preOrderPendingCount: 0,
    status: 'active'
  },
  {
    id: 'prod-007',
    sku: 'IG-2401',
    normalizedSku: 'IG2401',
    barcode: '4580412240101',
    brand: 'Ignition Model',
    name: 'Toyota Supra (A80) Top Secret GT300 1998',
    scale: '1:43',
    material: '樹脂模型 (Resin)',
    color: 'Yellow',
    imageUrl: '/images/products/prod-007.webp',
    listPrice: 3200,
    costPrice: 2100,
    vipPrice: 3040,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 0 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 0 },
      { location: 'company', locationName: '公司總倉', quantity: 2 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 2,
    preOrderPendingCount: 0,
    note: '僅公司總倉有貨，門市需調撥',
    status: 'active'
  },
  {
    id: 'prod-008',
    sku: 'KYO-08248S',
    normalizedSku: 'KYO08248S',
    barcode: '4545782082485',
    brand: 'Kyosho',
    name: 'Lamborghini Aventador SVJ 63 Verde Alceo',
    scale: '1:18',
    material: '合金開門版',
    color: 'Verde Alceo',
    imageUrl: '/images/products/prod-008.webp',
    listPrice: 8900,
    costPrice: 5900,
    vipPrice: 8455,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 1 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 0 },
      { location: 'company', locationName: '公司總倉', quantity: 0 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 1,
    preOrderPendingCount: 0,
    status: 'active'
  },
  {
    id: 'prod-009',
    sku: 'HOT-9642',
    normalizedSku: 'HOT9642',
    barcode: '887961009642',
    brand: 'Hot Wheels',
    name: 'Mercedes-Benz 300 SL 合金收藏版',
    scale: '1:64',
    material: '合金壓鑄',
    color: 'Silver',
    imageUrl: '/images/products/prod-009.webp',
    listPrice: 350,
    costPrice: 220,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 12 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 24 },
      { location: 'company', locationName: '公司總倉', quantity: 0 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 36,
    preOrderPendingCount: 0,
    status: 'active'
  },
  {
    id: 'prod-010',
    sku: 'AA-73632',
    normalizedSku: 'AA73632',
    barcode: '4534530073632',
    brand: 'AutoArt',
    name: 'Toyota 2000GT 紅色開篷版',
    scale: '1:18',
    material: '全開合金',
    color: 'Red',
    imageUrl: '/images/products/prod-010.webp',
    listPrice: 6800,
    costPrice: 4500,
    vipPrice: 6460,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 0 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 0 },
      { location: 'company', locationName: '公司總倉', quantity: 0 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 0,
    preOrderPendingCount: 2,
    note: '全店零庫存，僅接受預購',
    status: 'active'
  },
  {
    id: 'prod-011',
    sku: 'SP-S2055',
    normalizedSku: 'SPS2055',
    barcode: '9580006020558',
    brand: 'Spark',
    name: 'Ferrari 499P #51 2023 利曼冠軍',
    scale: '1:43',
    material: '樹脂模型 (Resin)',
    color: 'Rosso Corsa',
    imageUrl: '/images/products/prod-011.webp',
    listPrice: 3100,
    costPrice: 2050,
    vipPrice: 2945,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 2 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 3 },
      { location: 'company', locationName: '公司總倉', quantity: 1 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 6,
    preOrderPendingCount: 1,
    status: 'active'
  },
  {
    id: 'prod-012',
    sku: 'TLV-N266a',
    normalizedSku: 'TLVN266A',
    barcode: '4543736315262',
    brand: 'Tomica Limited Vintage',
    name: 'Nissan Silvia (S15) Spec-R Aero 閃電黃',
    scale: '1:64',
    material: '合金壓鑄',
    color: 'Lightning Yellow',
    imageUrl: '/images/products/prod-012.webp',
    listPrice: 920,
    costPrice: 600,
    vipPrice: 870,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 5 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 0 },
      { location: 'company', locationName: '公司總倉', quantity: 3 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 8,
    preOrderPendingCount: 0,
    status: 'active'
  },
  {
    id: 'prod-013',
    sku: 'INNO-64-R35-B',
    normalizedSku: 'INNO64R35B',
    barcode: '4897070184506',
    brand: 'Inno64',
    name: 'Nissan GT-R (R35) 2024 Nismo Stealth Grey',
    scale: '1:64',
    material: '合金壓鑄',
    color: 'Stealth Grey',
    imageUrl: '/images/products/prod-013.webp',
    listPrice: 680,
    costPrice: 440,
    vipPrice: 650,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 8 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 6 },
      { location: 'company', locationName: '公司總倉', quantity: 10 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 24,
    preOrderPendingCount: 0,
    status: 'active'
  },
  {
    id: 'prod-014',
    sku: 'MC-155026090',
    normalizedSku: 'MC155026090',
    barcode: '4012138166090',
    brand: 'Minichamps',
    name: 'Porsche 911 (992) GT3 RS 蜥蜴綠',
    scale: '1:18',
    material: '合金開門版',
    color: 'Lizard Green',
    imageUrl: '/images/products/prod-014.webp',
    listPrice: 7800,
    costPrice: 5200,
    vipPrice: 7410,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 1 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 2 },
      { location: 'company', locationName: '公司總倉', quantity: 4 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 7,
    preOrderPendingCount: 0,
    status: 'active'
  },
  {
    id: 'prod-015',
    sku: 'KYO-05551S',
    normalizedSku: 'KYO05551S',
    barcode: '4545782055518',
    brand: 'Kyosho',
    name: 'Honda NSX Type-R Championship White',
    scale: '1:18',
    material: '合金開門版',
    color: 'Championship White',
    imageUrl: '/images/products/prod-015.webp',
    listPrice: 6200,
    costPrice: 4100,
    vipPrice: 5890,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 0 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 2 },
      { location: 'company', locationName: '公司總倉', quantity: 1 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 3,
    preOrderPendingCount: 0,
    note: '門市缺貨，倉庫有 2 台可調撥',
    status: 'active'
  },
  {
    id: 'prod-016',
    sku: 'ACC-DISPLAY-01',
    normalizedSku: 'ACCDISPLAY01',
    barcode: '4712345678901',
    brand: 'Fred\'s 周邊',
    name: '1:64 壓克力展示盒 (五入組)',
    scale: '配件周邊',
    material: '壓克力',
    imageUrl: '/images/products/prod-016.webp',
    listPrice: 450,
    costPrice: 280,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 20 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 50 },
      { location: 'company', locationName: '公司總倉', quantity: 0 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 70,
    preOrderPendingCount: 0,
    status: 'active'
  },
  {
    id: 'prod-017',
    sku: 'IG-3201',
    normalizedSku: 'IG3201',
    barcode: '4580412320101',
    brand: 'Ignition Model',
    name: 'Mazda RX-7 (FD3S) RE Amemiya 改裝版',
    scale: '1:43',
    material: '樹脂模型 (Resin)',
    color: 'Gunmetal Grey',
    imageUrl: '/images/products/prod-017.webp',
    listPrice: 3500,
    costPrice: 2300,
    vipPrice: 3325,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 1 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 1 },
      { location: 'company', locationName: '公司總倉', quantity: 0 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 2,
    preOrderPendingCount: 0,
    status: 'active'
  },
  {
    id: 'prod-018',
    sku: 'MGT-00888',
    normalizedSku: 'MGT00888',
    barcode: '4892442008881',
    brand: 'Mini GT',
    name: 'Porsche 911 GT3 RS 4.0 Guards Red',
    scale: '1:64',
    material: '合金壓鑄',
    color: 'Guards Red',
    imageUrl: '/images/products/prod-018.webp',
    listPrice: 620,
    costPrice: 400,
    vipPrice: 590,
    stocks: [
      { location: 'store', locationName: '門市現貨', quantity: 0 },
      { location: 'warehouse', locationName: '後方倉庫', quantity: 0 },
      { location: 'company', locationName: '公司總倉', quantity: 0 },
      { location: 'other', locationName: '調度暫存', quantity: 0 }
    ],
    totalStock: 0,
    preOrderPendingCount: 3,
    note: '已停產，僅接受預購候補',
    status: 'discontinued'
  }
];
```

### 2.2 預訂單資料庫 (特別設計部分到貨的情境)

```typescript
export const INITIAL_PREORDERS: PreOrder[] = [
  {
    id: 'po-1001',
    orderNumber: 'PO-202607-0019',
    customerId: 'cust-001',
    customerName: '陳冠宇',
    customerPhone: '0912345678',
    orderDate: '2026-07-15',
    expectedArrivalDate: '2026-08-28',
    status: 'partially_arrived', // 核心展示亮點：部分到貨
    source: 'in_store',
    note: '常客，預訂兩台，交代到貨電話通知',
    updatedAt: '2026-08-28T14:20:00Z',
    items: [
      {
        id: 'poi-101',
        productId: 'prod-001',
        sku: 'AA-79121',
        productName: 'Nissan Skyline GT-R (R34) V-Spec II 灣岸藍',
        scale: '1:18',
        brand: 'AutoArt',
        quotedPrice: 6900,
        qtyOrdered: 2,       // 訂了 2 台
        qtyArrived: 1,       // 廠家本次先到貨 1 台
        qtyDelivered: 0      // 尚未領取 (可取貨 1 台，未到 1 台)
      },
      {
        id: 'poi-102',
        productId: 'prod-003',
        sku: 'INNO-64-FD2-W',
        productName: 'Honda Civic Type-R (FD2) 冠軍白 碳纖引擎蓋特仕版',
        scale: '1:64',
        brand: 'Inno64',
        quotedPrice: 620,
        qtyOrdered: 1,
        qtyArrived: 1,       // 已全數到貨 1 台
        qtyDelivered: 0      // 待領取 1 台
      }
    ]
  },
  {
    id: 'po-1002',
    orderNumber: 'PO-202608-0042',
    customerId: 'cust-002',
    customerName: '林俊宏 (小林)',
    customerPhone: '0988765432',
    orderDate: '2026-08-02',
    expectedArrivalDate: '2026-09-15',
    status: 'pending', // 尚未到貨
    source: 'website',
    note: '官網匯入訂單',
    updatedAt: '2026-08-02T10:00:00Z',
    items: [
      {
        id: 'poi-201',
        productId: 'prod-002',
        sku: 'SP-S7682',
        productName: 'Porsche 911 GT3 R #911 Manthey EMA 2024 紐柏林冠軍',
        scale: '1:43',
        brand: 'Spark',
        quotedPrice: 2850,
        qtyOrdered: 1,
        qtyArrived: 0,
        qtyDelivered: 0
      }
    ]
  },
  {
    id: 'po-1003',
    orderNumber: 'PO-202606-0012',
    customerId: 'cust-003',
    customerName: '極速模型工作室 (統編戶)',
    customerPhone: '0933112233',
    orderDate: '2026-06-10',
    expectedArrivalDate: '2026-08-15',
    status: 'partially_completed', // 已領取部分，尚有未到貨品項
    source: 'in_store',
    note: '批發客戶，已領 1 台 GT3 RS，另 1 台尚未到貨',
    updatedAt: '2026-08-20T16:30:00Z',
    items: [
      {
        id: 'poi-301',
        productId: 'prod-014',
        sku: 'MC-155026090',
        productName: 'Porsche 911 (992) GT3 RS 蜥蜴綠',
        scale: '1:18',
        brand: 'Minichamps',
        quotedPrice: 7500,
        qtyOrdered: 2,
        qtyArrived: 2,
        qtyDelivered: 1       // 已領 1 台，尚可領 1 台
      },
      {
        id: 'poi-302',
        productId: 'prod-011',
        sku: 'SP-S2055',
        productName: 'Ferrari 499P #51 2023 利曼冠軍',
        scale: '1:43',
        brand: 'Spark',
        quotedPrice: 3000,
        qtyOrdered: 1,
        qtyArrived: 0,
        qtyDelivered: 0       // 尚未到貨
      }
    ]
  }
];
```

### 2.3 客戶會員資料庫

```typescript
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    name: '陳冠宇',
    phone: '0912345678',
    email: 'kuanyu.chen@example.com',
    vipTier: 'gold',
    vipTierName: '金卡會員 (95折)',
    rewardPoints: 350,
    totalSpent: 48600,
    note: '主力收藏 1:18 日系 JDM，自取偏好週五晚間',
    createdAt: '2025-03-12'
  },
  {
    id: 'cust-002',
    name: '林俊宏 (小林)',
    phone: '0988765432',
    email: 'lin.jh@example.com',
    vipTier: 'silver',
    vipTierName: '銀卡會員',
    rewardPoints: 120,
    totalSpent: 16800,
    note: '專收 1:43 利曼與 GT 賽車',
    createdAt: '2025-09-08'
  },
  {
    id: 'cust-003',
    name: '極速模型工作室 (統編戶)',
    phone: '0933112233',
    email: 'service@speedy-models.tw',
    vipTier: 'platinum',
    vipTierName: '白金黑卡 (9折)',
    rewardPoints: 1280,
    totalSpent: 135000,
    note: '固定開統編: 83521409 抬頭: 極速模型工作室',
    createdAt: '2024-11-01'
  }
];
```

### 2.4 歷史結帳單種子 (`INITIAL_ORDERS`)

供「客戶會員 → 歷史結帳紀錄」與「補印收據」展示使用，預置 3 筆涵蓋手動改價、預購取貨、組合支付等情境：

```typescript
export const INITIAL_ORDERS: CheckoutOrder[] = [
  {
    id: 'so-2001',
    orderNumber: 'SO-20260825-0076',
    cashierId: 'staff-001',
    cashierName: '店長 Fred',
    customerId: 'cust-001',
    customerName: '陳冠宇',
    customerPhone: '0912345678',
    items: [
      {
        productId: 'prod-003',
        sku: 'INNO-64-FD2-W',
        name: 'Honda Civic Type-R (FD2) 冠軍白 碳纖引擎蓋特仕版',
        scale: '1:64',
        originalPrice: 650,
        unitPrice: 600,
        isManualPrice: true,
        priceDiffReason: '熟客折扣',
        quantity: 2,
        subtotal: 1200
      }
    ],
    itemsSubtotal: 1200,
    discountAmount: 100,
    shippingFee: 0,
    totalAmount: 1100,
    payments: [
      { type: 'cash', name: '現金', amount: 1100, tenderedCash: 2000, changeAmount: 900 }
    ],
    invoice: { type: 'carrier', carrierCode: '/ABC+123' },
    earnedPoints: 11,
    usedPoints: 0,
    createdAt: '2026-08-25T19:32:00Z'
  },
  {
    id: 'so-2002',
    orderNumber: 'SO-20260818-0063',
    cashierId: 'staff-001',
    cashierName: '店長 Fred',
    customerId: 'cust-003',
    customerName: '極速模型工作室 (統編戶)',
    customerPhone: '0933112233',
    items: [
      {
        productId: 'prod-014',
        sku: 'MC-155026090',
        name: 'Porsche 911 (992) GT3 RS 蜥蜴綠',
        scale: '1:18',
        originalPrice: 7800,
        unitPrice: 7500,
        isManualPrice: false,
        quantity: 1,
        subtotal: 7500,
        preOrderId: 'po-1003',
        preOrderItemId: 'poi-301'
      }
    ],
    itemsSubtotal: 7500,
    discountAmount: 0,
    shippingFee: 0,
    totalAmount: 7500,
    payments: [
      { type: 'credit_card', name: '信用卡', amount: 5000, transactionRef: '1234' },
      { type: 'bank_transfer', name: '銀行轉帳', amount: 2500, transactionRef: '67890' }
    ],
    invoice: { type: 'tax_id', taxId: '83521409', buyerTitle: '極速模型工作室' },
    earnedPoints: 75,
    usedPoints: 0,
    note: '預購取貨第一批次',
    createdAt: '2026-08-18T14:15:00Z'
  },
  {
    id: 'so-2003',
    orderNumber: 'SO-20260810-0051',
    cashierId: 'staff-001',
    cashierName: '店長 Fred',
    items: [
      {
        productId: 'prod-001',
        sku: 'AA-79121',
        name: 'Nissan Skyline GT-R (R34) V-Spec II 灣岸藍',
        scale: '1:18',
        originalPrice: 7200,
        unitPrice: 7000,
        isManualPrice: true,
        priceDiffReason: '老闆特批',
        quantity: 1,
        subtotal: 7000
      },
      {
        productId: 'prod-016',
        sku: 'ACC-DISPLAY-01',
        name: '1:64 壓克力展示盒 (五入組)',
        scale: '配件周邊',
        originalPrice: 450,
        unitPrice: 450,
        isManualPrice: false,
        quantity: 1,
        subtotal: 450
      }
    ],
    itemsSubtotal: 7450,
    discountAmount: 0,
    shippingFee: 0,
    totalAmount: 7450,
    payments: [
      { type: 'line_pay', name: 'LINE Pay', amount: 7450 }
    ],
    invoice: { type: 'none' },
    earnedPoints: 74,
    usedPoints: 0,
    createdAt: '2026-08-10T11:20:00Z'
  }
];
```

> `mockDataSeed.ts` 應同時匯出 `INITIAL_PRODUCTS`、`INITIAL_PREORDERS`、`INITIAL_CUSTOMERS`、`INITIAL_ORDERS`，並在 `storageHelper` 初始化時一併寫入 localStorage。
