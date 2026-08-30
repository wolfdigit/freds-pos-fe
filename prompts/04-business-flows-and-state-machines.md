# 04 - 核心業務流程與狀態機邏輯規範

> **目標**：詳細規範模型車門市三大關鍵業務邏輯：**預購單分批到貨與沖銷狀態機**、**瑕疵換貨（負數單據）**、**手動改價**、**結帳扣庫存規則**與**貨號去 Dash 搜尋演算法**。

---

## 0. 中英文命名對照表 (Naming Glossary)

| 中文 UI 用語 | 程式碼識別符 | 說明 |
| :--- | :--- | :--- |
| 帶入結帳清單 / 帶入結帳櫃檯 | `importPreOrderItem()` | 預購品項加入購物車 |
| 快速帶入未結預訂單 / 預購偵測提貨 | `CustomerBindCard` / `PreOrderImportDrawer` | 會員卡片自動偵測未結預購單並提供一鍵帶入（保留抽屜作為備用） |
| 手動改價 (Inline 即時編輯) | `updateItemPrice()` / `isManualPrice` | 清單單價輸入框直接覆寫單價 |
| 前往結帳付款 | `PaymentModal` / `createCheckoutOrder()` | 組合支付彈窗 |
| 取貨付款 | `PaymentMethodType: 'cod'` | **Mockup 階段不實作**，僅保留型別 |
| 部分已結 | `partially_completed` | 預購單狀態 |
| 部分到貨 | `partially_arrived` | 預購單狀態（含「全到貨但未領」） |

---

## 1. 預購單沖銷狀態機 (PreOrder Partial Fulfillment)

模型車因原廠（如 AutoArt, Spark, MiniGT）經常分批出貨，門市最常見的痛點是「預訂 2 台，廠家先來 1 台，客人先領 1 台，下次再來領另 1 台」。本系統必須提供精準的狀態流轉。

> **設計決策**：不使用獨立的 `fully_arrived` 狀態。當所有品項 `qtyArrived == qtyOrdered` 但尚未領取完畢時，仍歸類為 `partially_arrived`，以品項層級的 `qtyArrived / qtyDelivered` 區分細節。

### 1.1 預購狀態機流轉圖

```
                 [ 建立預訂單 ]
                       |
                       v
                 +-----------+
                 |  pending  | (所有品項 qtyArrived = 0)
                 +-----------+
                       |
        [ 廠商到貨通知 (部分或全數) — Phase 1 由種子預設 ]
                       |
                       v
              +---------------------+
              |  partially_arrived  | (至少一項 qtyArrived > 0，且尚未全數領完)
              +---------------------+
                       |
             [ 櫃檯結帳取貨沖銷 ]
                       |
        +--------------+--------------+
        | (仍有未領完品項)             | (全數領取完畢)
        v                             v
+-----------------------+     +---------------+
|  partially_completed  |     |   completed   | (結案已結清)
+-----------------------+     +---------------+
```

### 1.2 狀態推導函式 (Status Derivation)

```typescript
function derivePreOrderStatus(items: PreOrderItem[]): PreOrderStatus {
  const allNotArrived = items.every(i => i.qtyArrived === 0);
  const allDelivered = items.every(i => i.qtyDelivered === i.qtyOrdered);
  const someDelivered = items.some(i => i.qtyDelivered > 0);

  if (allNotArrived) return 'pending';
  if (allDelivered) return 'completed';
  if (someDelivered) return 'partially_completed';
  return 'partially_arrived';
}
```

### 1.3 品項數量沖銷邏輯 (Item-Level Logic)

每個 `PreOrderItem` 維護三個關鍵數值：
1. `qtyOrdered`（下訂總數，不可變）
2. `qtyArrived`（已到貨總數）
3. `qtyDelivered`（客人已提領總數）

**約束規則**：
- **目前可提領數量** = `qtyArrived - qtyDelivered`
- **尚未到貨數量** = `qtyOrdered - qtyArrived`
- 當店員在「帶入預購單抽屜」選擇提領數量 \( \Delta Q \) 時：
  - 檢核條件：\( 1 \le \Delta Q \le (\text{qtyArrived} - \text{qtyDelivered}) \)
- 當該結帳單結帳完成時：
  - 更新：\( \text{qtyDelivered}_{\text{new}} = \text{qtyDelivered}_{\text{old}} + \Delta Q \)
  - 呼叫 `derivePreOrderStatus()` 重算訂單狀態

---

## 2. 結帳扣庫存規則 (Stock Deduction on Checkout)

### 2.1 一般銷售（正數品項）

| 規則 | 說明 |
| :--- | :--- |
| 扣減地點 | **一律從 `store`（門市現貨）扣減** |
| 庫存不足 | **阻擋結帳**，Toast 提示「門市現貨不足，請先從倉庫調撥」 |
| 預購取貨 | 同樣扣減 `store` 庫存（預購到貨後應已入庫至門市） |
| `totalStock` | 扣減後同步重算所有 location 加總 |

### 2.2 退換貨（負數品項）

| 規則 | 說明 |
| :--- | :--- |
| 庫存回補 | 負數品項結帳完成後，**加回 `store` 庫存** |
| 數量 | `quantity = -1` 表示退回 1 件至門市 |

### 2.3 結帳前置驗證 (Checkout Validation Gate)

在 `createCheckoutOrder` 執行前，逐一檢查：
1. 每個正數品項：`store.quantity >= item.quantity`
2. 每個預購關聯品項：\( \Delta Q \le (\text{qtyArrived} - \text{qtyDelivered}) \)
3. 支付總額：\( \sum \text{PaymentAmount} \ge \text{TotalOrderAmount} \)

任一條件不滿足 → 拋出業務錯誤，UI 以 Toast 顯示，**不寫入任何資料**。

---

## 3. 瑕疵換貨與負數單據邏輯 (Defect Exchange & Returns)

實體門市常有客人購買後發現車身水貼微歪、漆面刮傷，回門市進行「補差額換貨」或「退貨」。

### 3.1 購物車負數金額計算規則

1. 購物車品項支援設定 `quantity = -1`（或由 UI 上的 `[退換貨]` 按鈕觸發）。
2. **範例情境：退瑕疵車 $650，換新車 $880**：
   - 購物車項目 1：`INNO-64-FD2-W`，數量 `-1`，單價 `$650` → 小計 `-$650`
   - 購物車項目 2：`TLV-N234a`，數量 `+1`，單價 `$880` → 小計 `+$880`
   - **應收總額** = `$880 + (-$650) = NT$ 230`（客人僅需補差價 $230）。
3. **範例情境：純退貨（總額為負數）**：
   - 應收總額為 `-$650`。
   - 結帳介面自動切換為「門市退款」模式，收銀抽屜退還現金 $650 給顧客。
4. **庫存連動**：見 §2.2。

---

## 4. 手動改價與會員價計算規則 (Price Override Flow)

模型車商品有其獨特議價情境（如熟客優惠、微盒損出清、老闆特批價）。

```typescript
interface PriceCalculationResult {
  originalListPrice: number;    // 原牌價 (例: 7200)
  effectiveUnitPrice: number;   // 最終單價 (例: 7000)
  isOverridden: boolean;        // 是否改價
  discountAmountPerUnit: number;// 每件折抵 (7200 - 7000 = 200)
  totalLineDiscount: number;    // 本行折抵總額 (200 * 數量)
}
```

### 4.1 價格優先順序

1. 若店員**手動改價**（`isManualPrice = true`）：以手動價為最高優先級，**不被會員價覆寫**。
2. 若已綁定會員且**無手動改價**：
   - 若商品有設定 `vipPrice` → 套用 `vipPrice`
   - 否則依會員等級折扣（金卡 95 折、白金 9 折）計算
3. 一般情況：套用牌價 `listPrice`。
4. **預購取貨品項**：帶入時使用 `quotedPrice`（預購報價），不受會員價影響。

### 4.2 會員綁定時的 UI 行為

| 觸發時機 | 行為 |
| :--- | :--- |
| 綁定會員（`attachCustomer`） | 購物車中**尚未手動改價**的品項，自動重新計算並套用 VIP 價 |
| 已手動改價的品項 | **維持現有單價不變**，顯示 `[已改價]` 徽章 |
| 解除會員綁定 | 未手動改價的品項恢復為 `listPrice` |
| 新加入購物車的品項 | 若已綁定會員，加入時即套用 VIP 價 |

### 4.3 改價記錄

結帳單必須完整記錄 `originalPrice` 與 `unitPrice`，供後續日報表統計「店員折讓總額」。

---

## 5. 組合支付與找零精算機制 (Multi-Tender Payments)

門市常見顧客身上現金不足，要求「千元鈔付現 $1,620，剩下 $6,000 刷卡」：

1. **支付清單維護**：
   - 支援加入多筆 `PaymentTender`（例：Tender 1 刷卡 $6,000；Tender 2 現金 $1,620）。
   - Mockup 階段 UI 僅顯示：`現金`、`信用卡`、`LINE Pay`、`銀行轉帳`。
2. **現金找零公式**：
   - 假設應付現金為 \( A_{\text{due}} \)，顧客給予鈔票金額為 \( A_{\text{cash\_in}} \)：
   $$\text{Change} = A_{\text{cash\_in}} - A_{\text{due}}$$
   - 只有在 \( A_{\text{cash\_in}} \ge A_{\text{due}} \) 時允許確認出單。
3. **完成結帳的前置條件**：見 §2.3。

---

## 6. 貨號去 Dash 容錯搜尋演算法 (SKU Normalizer)

在模型車領域中，不同廠家與官網的編碼格式常有橫槓差異（如官網寫 `AA-79121`，條碼槍刷出來或客人搜尋只打 `AA79121`；`INNO-64-FD2-W` 常被簡化為 `INNO64FD2W`）。

### 6.1 規格化演算法實作要求 (`src/utils/skuNormalizer.ts`)

```typescript
/**
 * 將貨號轉為標準純字母數字大寫字串
 * 例如: " aa - 79121_b " -> "AA79121B"
 */
export function normalizeSku(input: string): string {
  if (!input) return '';
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ''); // 移除所有橫槓、底線、空白及特殊符號
}

/**
 * 模糊搜尋匹配函式
 */
export function isSkuMatch(query: string, productSku: string, productBarcode?: string): boolean {
  const normalizedQuery = normalizeSku(query);
  const normalizedTarget = normalizeSku(productSku);

  if (!normalizedQuery) return true;

  // 1. 去 Dash 完全或前綴匹配
  if (normalizedTarget.includes(normalizedQuery)) return true;

  // 2. 條碼匹配
  if (productBarcode && productBarcode.includes(query.trim())) return true;

  return false;
}
```

此演算法必須內建於 `MockProductService.searchProducts` 中，確保收銀員無論輸入有無橫槓，皆能在 50ms 內得到精準結果。

---

## 7. 錯誤處理與 UI 回饋規範 (Error Handling)

Service 層應拋出帶有 `code` 的業務錯誤，UI 層統一以 Toast 呈現：

| 錯誤碼 | 觸發情境 | UI 回饋 |
| :--- | :--- | :--- |
| `INSUFFICIENT_STORE_STOCK` | 門市現貨不足 | Toast 警告：「門市現貨不足，請先從倉庫調撥」 |
| `PREORDER_QTY_EXCEEDED` | 預購可取數量超限 | 表單欄位紅框 + 「超過可取數量上限」 |
| `PAYMENT_INSUFFICIENT` | 支付總額不足 | 結帳彈窗內紅字提示，禁用確認按鈕 |
| `PRODUCT_NOT_FOUND` | 搜尋無結果 | 空狀態卡片（見 `05` §5） |
| `STORAGE_CORRUPTED` | localStorage 解析失敗 | 自動 `resetDemoData()` + Toast：「示範資料已自動還原」 |

```typescript
// src/utils/errors.ts
export class BusinessError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
  }
}
```

**事務一致性**：`createCheckoutOrder` 內所有寫入（庫存、預購沖銷、訂單、會員點數）必須在同一邏輯區塊內完成；任一子步驟失敗則**全部回滾**，不產生半完成狀態。
