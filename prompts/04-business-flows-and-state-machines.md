# 04 - 核心業務流程與狀態機邏輯規範

> **目標**：詳細規範模型車門市關鍵業務邏輯：**瑕疵換貨（負數單據）**、**手動改價**、**結帳扣庫存規則**與**貨號去 Dash 搜尋演算法**。

---

## 0. 中英文命名對照表 (Naming Glossary)

| 中文 UI 用語 | 程式碼識別符 | 說明 |
| :--- | :--- | :--- |
| 手動改價 (Inline 即時編輯) | `updateItemPrice()` / `isManualPrice` | 清單單價輸入框直接覆寫單價 |
| 前往結帳付款 | `PaymentModal` / `createCheckoutOrder()` | 組合支付彈窗 |
| 貨到付款 | `PaymentMethodType: 'cod'` | 付款方式之一 |

---

## 1. 結帳扣庫存規則 (Stock Deduction on Checkout)

### 1.1 一般銷售（正數品項）

| 規則 | 說明 |
| :--- | :--- |
| 扣減地點 | **一律從 `store`（門市現貨）扣減** |
| 庫存不足 | **阻擋結帳**，Toast 提示「門市現貨不足，請先從倉庫調撥」 |
| `totalStock` | 扣減後同步重算所有 location 加總 |

### 1.2 退換貨（負數品項與全鏈路原單關聯）

| 規則 | 說明 |
| :--- | :--- |
| 原單關聯 | 退換貨（`quantity < 0`）**必須關聯原銷售單據**（`originalOrderId` + `originalOrderItemId`） |
| 可退數量校驗 | 驗證 `abs(quantity) <= (qtySold - qtyReturned)`，防重複或超額退貨 |
| 庫存回補 | `restock` 省略或 `true` 時加回登入門市正常貨（可售）。`false` 時加到該門市退貨庫存點，數量仍會增加 |
| 預購取貨 | 銷售列勾「預購取貨」(`preorderPickup: true`) 時，從登入門市綁定的預購保留地點扣庫存，不扣門市庫存。退貨列不可勾；可和點數折抵並用。每間門市綁三個地點：門市庫存、預購保留、退貨。公司總倉／預購保留／退貨品是系統庫存點，不能刪、可以改名。 |
| 原單狀態推導 | 更新原單品項 `returnedQuantity`，全數退完轉為 `refunded`，部分退完轉為 `partially_refunded` |

### 1.3 結帳前置驗證 (Checkout Validation Gate)

在 `createCheckoutOrder` 執行前，在單一 DB Transaction 內逐一檢查：
1. 每個正數品項：`store.quantity >= item.quantity`（行鎖防超賣，不足拋出 `INSUFFICIENT_STORE_STOCK`）
2. 每個退換貨品項：\( \text{abs}(Q) \le (Q_{\text{sold}} - Q_{\text{returned}}) \)（超額拋出 `RETURN_QTY_EXCEEDED`）
3. 會員點數折抵：\( \text{usedPoints} \le \text{customer.rewardPoints} \)（不足拋出 `INSUFFICIENT_POINTS`）
4. 支付總額：\( \sum \text{PaymentAmount} \ge \text{TotalOrderAmount} \)（不足拋出 `PAYMENT_INSUFFICIENT`）
5. 門市商品清單：登入門市為清單模式時，每個正數品項必須在該門市清單內（不在拋出 `PRODUCT_NOT_IN_STORE`，HTTP 409）。退貨（負數品項）不檢查。

任一條件不滿足 → 拋出業務錯誤，UI 以 Toast 顯示，**不寫入任何資料 (Rollback)**。

---

### 1.4 門市商品清單規則

| 情境 | 規則 |
| :--- | :--- |
| 販售範圍 | `store_branch.productScope`：`all`（預設）或 `list`，任何業務帳號都能切換 |
| 搜尋 / 庫存列表 | 清單模式門市只回清單內商品；任何業務帳號可帶 `allProducts=true` 看全部；沒有登入門市的管理員看全部 |
| 單一商品 | `GET /products/{id}` 不過濾，但回 `soldInLoginStore`，前端據此把購物車品項標為 `notInStore` |
| 結帳 | 正數品項不在清單 → `PRODUCT_NOT_IN_STORE`；退貨允許 |
| 編輯清單 | 勾選暫存在畫面上，按「存檔」以 `POST .../products/batch` 一次送出，同一交易；任一加入的商品不存在或已刪除則整批不寫入 |
| 新增商品 | 只會自動加入「登入中的清單模式門市」 |
| 調撥 / 調整 / 進貨 | 只過濾畫面上的商品選單，API 不擋 |
| 刪除商品 | 留在清單但不顯示、不計入清單商品數 |

---

## 2. 瑕疵換貨與統一退換貨單據管線 (Defect Exchange & Returns Pipeline)

實體門市常有客人購買後發現車身水貼微歪、漆面刮傷，回門市進行「補差額換貨」或「純退款」。Fred's POS 採用**統一交易管線**：不設獨立退款 API，所有退換貨一律藉由帶入負數品項至購物車，透過 `POST /checkout/orders` 統一處理。

### 2.1 退換貨雙操作動線

1. **動線 1（收銀台掃描退貨條碼）**：
   * 店員在結帳櫃檯掃描瑕疵商品條碼。
   * 呼叫 `GET /checkout/orders?productId=...` 彈窗列出近期售出該商品的單據。
   * 勾選原單品項後帶入購物車（數量為負數，自動綁定 `originalOrderId` 與 `originalOrderItemId`）。
   * 可繼續掃入新商品（如退 $650 車，換 $880 車，應付總額 $230 補差價出單）。
2. **動線 2（歷史單據查詢發起退貨）**：
   * 在客戶詳情或歷史訂單查詢畫面（支援會員電話、日期範圍、關鍵字反查散客單據）。
   * 點選「辦理退換貨」，勾選退貨品項與數量。
   * 一鍵傳送至購物車，進行純退款出單（應收總額為負數，開立折讓單/退款收據）或繼續加購換貨。

---

## 3. 手動改價與會員價計算規則 (Price Override Flow)

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

### 3.1 價格優先順序

1. 若店員**手動改價**（`isManualPrice = true`）：以手動價為最高優先級，**不被會員價覆寫**。
2. 若已綁定會員且**無手動改價**：
   - 若商品有設定 `vipPrice` → 套用 `vipPrice`
   - 否則依會員等級折扣（金卡 95 折、白金 9 折）計算
3. 一般情況：套用牌價 `listPrice`。

### 3.2 會員綁定時的 UI 行為

| 觸發時機 | 行為 |
| :--- | :--- |
| 綁定會員（`attachCustomer`） | 購物車中**尚未手動改價**的品項，自動重新計算並套用 VIP 價 |
| 已手動改價的品項 | **維持現有單價不變**，顯示 `[已改價]` 徽章 |
| 解除會員綁定 | 未手動改價的品項恢復為 `listPrice` |
| 新加入購物車的品項 | 若已綁定會員，加入時即套用 VIP 價 |

### 3.3 改價記錄

結帳單必須完整記錄 `originalPrice` 與 `unitPrice`，供後續日報表統計「店員折讓總額」。

---

## 4. 組合支付與找零精算機制 (Multi-Tender Payments)

門市常見顧客身上現金不足，要求「千元鈔付現 $1,620，剩下 $6,000 刷卡」：

1. **支付清單維護**：
   - 支援加入多筆 `PaymentTender`（例：Tender 1 刷卡 $6,000；Tender 2 現金 $1,620）。
   - Mockup 階段 UI 僅顯示：`現金`、`信用卡`、`LINE Pay`、`銀行轉帳`。
2. **現金找零公式**：
   - 假設應付現金為 \( A_{\text{due}} \)，顧客給予鈔票金額為 \( A_{\text{cash\_in}} \)：
   $$\text{Change} = A_{\text{cash\_in}} - A_{\text{due}}$$
   - 只有在 \( A_{\text{cash\_in}} \ge A_{\text{due}} \) 時允許確認出單。
3. **完成結帳的前置條件**：見 §1.3。

---

## 5. 貨號去 Dash 容錯搜尋演算法 (SKU Normalizer)

在模型車領域中，不同廠家與官網的編碼格式常有橫槓差異（如官網寫 `AA-79121`，條碼槍刷出來或客人搜尋只打 `AA79121`；`INNO-64-FD2-W` 常被簡化為 `INNO64FD2W`）。

### 5.1 規格化演算法實作要求 (`src/utils/skuNormalizer.ts`)

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

此演算法必須內建於 `MockProductService.searchProductPage` 中，確保收銀員無論輸入有無橫槓，皆能在 50ms 內得到精準結果。

---

## 6. 錯誤處理與 UI 回饋規範 (Error Handling)

Service 層應拋出帶有 `code` 的業務錯誤，UI 層統一以 Toast 呈現：

| 錯誤碼 | 觸發情境 | UI 回饋 |
| :--- | :--- | :--- |
| `INSUFFICIENT_STORE_STOCK` | 門市現貨不足 | Toast 警告：「門市現貨不足，請先從倉庫調撥」 |
| `RETURN_QTY_EXCEEDED` | 退貨數量超過原單剩餘可退上限 | Toast 警告：「退貨數量超過原單剩餘可退上限」 |
| `INSUFFICIENT_POINTS` | 會員折抵點數不足 | 結帳彈窗紅字提示：「會員點數餘額不足」 |
| `PAYMENT_INSUFFICIENT` | 支付總額不足 | 結帳彈窗內紅字提示，禁用確認按鈕 |
| `PRODUCT_NOT_FOUND` | 搜尋無結果 | 空狀態卡片（見 `05` §5） |
| `CUSTOMER_NOT_FOUND` | 會員不存在 | Toast 警告：「找不到指定會員」 |
| `ORDER_NOT_FOUND` | 原銷售訂單不存在 | Toast 警告：「找不到原始銷售單據」 |
| `STORAGE_CORRUPTED` | localStorage 解析失敗 | 自動 `resetDemoData()` + Toast：「示範資料已自動還原」 |

```typescript
// src/utils/errors.ts
export class BusinessError extends Error {
  constructor(
    public code: BusinessErrorCode,
    message: string
  ) {
    super(message);
  }
}
```

**事務一致性**：`createCheckoutOrder` 內所有寫入（庫存、退貨可退計數、訂單、會員點數與消費額）必須在單一 DB Transaction / 邏輯區塊內完成；任一子步驟失敗則**全部回滾**，不產生半完成狀態。
