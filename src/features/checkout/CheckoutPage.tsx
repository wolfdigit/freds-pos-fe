import { useRef, useState, useEffect } from 'react';
import { useProductSearch } from './hooks/useProductSearch';
import { useSearchEnter } from './hooks/useSearchEnter';
import { useCheckoutWorkflow } from './hooks/useCheckoutWorkflow';
import { blockingCartItems, unavailableReason, useCartProductCheck } from './hooks/useCartProductCheck';
import { UnavailableCartLine } from './components/UnavailableCartLine';
import { clearCheckoutKey } from './checkoutIdempotency';
import { ProductSearchBar } from './components/ProductSearchBar';
import { ProductResultTable } from './components/ProductResultTable';
import { CartItemRow, ReturnCartItemRow } from './components/CartItemRow';
import { CartSummary } from './components/CartSummary';
import { CustomerBindCard } from './components/CustomerBindCard';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ReturnOrderModal } from './components/ReturnOrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { useBarcodeSiblings } from '@/hooks/useBarcodeSiblings';
import { LoadMoreFooter } from '@/components/common/LoadMoreFooter';
import { useCartStore } from '@/store/cartStore';
import { useSessionStore } from '@/store/sessionStore';
import { useUiStore } from '@/store/uiStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { productService, checkoutService } from '@/services';
import { formatCurrency } from '@/utils/currency';
import { orderAmountBreakdown } from '@/utils/orderBreakdown';
import { exceedsLoginStoreQuantity, formatLoginStoreQuantity, type Product } from '@/types/product';
import type { CheckoutOrder } from '@/types/checkout';

export function CheckoutPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { keyword, setKeyword, brand, setBrand, results, total, hasMore, isLoading, isLoadingMore, loadMore, resultsMatch } =
    useProductSearch();
  const resolveSearchEnter = useSearchEnter({ keyword, brand, results, hasMore, resultsMatch });
  const cart = useCartStore();
  const ui = useUiStore();
  const showToast = useToastStore((s) => s.showToast);
  const { unavailable, revalidate: revalidateCartProducts } = useCartProductCheck(cart.items);
  const { isSubmitting, receipt, setReceipt, submitCheckout } = useCheckoutWorkflow({
    onProductNotFound: () => {
      setIsPaymentOpen(false);
      void revalidateCartProducts();
    },
  });
  const [isCheckingCart, setIsCheckingCart] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailSource, setDetailSource] = useState<'catalog' | 'cart' | 'overstock'>('catalog');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnModalPrefill, setReturnModalPrefill] = useState<{ productId?: string; keyword?: string }>({});
  const [inspectedOrder, setInspectedOrder] = useState<CheckoutOrder | null>(null);
  const [inspectedReturnItem, setInspectedReturnItem] = useState<(typeof cart.items)[number] | null>(null);
  const [detailBusyId, setDetailBusyId] = useState<string | null>(null);
  const [returnBusyKey, setReturnBusyKey] = useState<string | null>(null);
  const detailLock = useRef(false);
  const returnLock = useRef(false);

  const salesItems = cart.items.filter((i) => i.quantity > 0);
  // 同條碼的其他貨號：只查購物車裡出現的條碼，不再抓全部商品。
  const siblingsByBarcode = useBarcodeSiblings(salesItems.map((item) => item.barcode));
  const returnItems = cart.items.filter((i) => i.quantity < 0);

  const returnSubtotal = returnItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  // 與收據、單據明細相同：商品原價 + 價格調整 − 點數折抵 = 成交小計；點數列差額只算點數折抵。
  const salesBreakdown = orderAmountBreakdown(salesItems);
  const returnBreakdown = orderAmountBreakdown(returnItems);
  const breakdown = orderAmountBreakdown(cart.items);

  const salesSubtotal = salesBreakdown.finalTotal;
  const salesQuantity = cart.getSalesItemsCount();
  const returnQuantity = cart.getReturnItemsCount();

  const formatQuantity = (quantity: number, lineCount: number) => {
    return `${lineCount} 款 · 共 ${quantity} 件`;
  };
  const totalAmount = cart.getTotalAmount();

  const focusBarcode = () => {
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  useEffect(() => {
    focusBarcode();
  }, []);

  const handleSearchSubmit = async () => {
    // 以按下 Enter 當下的輸入文字為準；畫面上若還是上一次搜尋的結果，會重新查詢，不會加入舊結果。
    const outcome = await resolveSearchEnter();
    if (!outcome) return;
    const { query, product } = outcome;
    if (product) {
      handleAddProduct(product);
      showToast(`已帶入【${product.name}】(${product.sku})`, 'success');
      setKeyword('');
    } else if (isReturnMode) {
      // 只販售清單商品的門市搜尋不到清單外的商品，但這些商品仍可退貨：直接用輸入內容查原始單據。
      setReturnModalPrefill({ keyword: query });
      setIsReturnModalOpen(true);
      setKeyword('');
    } else {
      showToast('查無符合之商品，請確認條碼或貨號', 'warning');
    }
  };

  const handleAddProduct = (product: Product) => {
    if (isReturnMode) {
      setReturnModalPrefill({ productId: product.id, keyword: product.sku });
      setIsReturnModalOpen(true);
      showToast(`請選擇【${product.name}】售出的原始單據以辦理退換貨`, 'info');
      return;
    }

    const sellable = product.loginStoreQuantity;
    const existing = cart.items.find((i) => i.productId === product.id && i.quantity > 0);
    const newQty = (existing?.quantity ?? 0) + 1;

    if (exceedsLoginStoreQuantity(newQty, sellable)) {
      showToast(
        `警示：「${product.name}」結帳數量 (${newQty}台) 超過本門市可售 ${sellable} 台（退貨庫存 ${formatLoginStoreQuantity(product.loginStoreReturnedQuantity)} 台）。仍可結帳，該庫存點可能變成負數。`,
        'warning'
      );
    }
    cart.addItem(product, 1);
    focusBarcode();
  };

  const handleUpdateQuantity = (item: (typeof cart.items)[number], newQty: number) => {
    if (item.quantity < 0 || newQty < 0) {
      const absNewQty = Math.abs(newQty);
      if (item.maxReturnableQty !== undefined && absNewQty > item.maxReturnableQty) {
        showToast(
          `警示：「${item.name}」退貨數量 (${absNewQty} 件) 超過原單剩餘可退上限 (${item.maxReturnableQty} 件)，已自動限制為最大上限`,
          'warning'
        );
        cart.updateItemQuantity(item.productId, -item.maxReturnableQty);
        return;
      }
    } else if (newQty > 0) {
      const sellable = item.loginStoreQuantity;
      if (exceedsLoginStoreQuantity(newQty, sellable)) {
        showToast(
          `警示：「${item.name}」數量 (${newQty}台) 超過本門市可售 (${sellable}台，退貨庫存 ${formatLoginStoreQuantity(item.loginStoreReturnedQuantity)} 台)。仍可結帳。`,
          'warning'
        );
      }
    }
    cart.updateItemQuantity(item.productId, newQty);
  };


  const handleStartCheckout = async () => {
    if (!useSessionStore.getState().storeName.trim()) {
      showToast('請先在上方選擇登入門市，才能結帳或辦理退貨。', 'warning');
      return;
    }
    if (isCheckingCart) return;
    // 送出前再向後端確認一次購物車商品，已不存在或已下架的商品要先移除。
    setIsCheckingCart(true);
    let latestUnavailable = unavailable;
    try {
      latestUnavailable = await revalidateCartProducts();
    } finally {
      setIsCheckingCart(false);
    }
    const blocked = blockingCartItems(useCartStore.getState().items, latestUnavailable);
    if (blocked.length > 0) {
      showToast(
        `購物車有 ${blocked.length} 項商品已不存在、已下架或本門市未販售（例如「${blocked[0].name}」），請移除標示紅色的商品後再結帳。`,
        'error',
        10000
      );
      return;
    }
    // 檢查退貨數量是否超過原單上限
    const overReturnItems = cart.items.filter(
      (i) => i.quantity < 0 && i.maxReturnableQty !== undefined && Math.abs(i.quantity) > i.maxReturnableQty
    );
    if (overReturnItems.length > 0) {
      showToast(`清單中「${overReturnItems[0].name}」退貨數量超出原單上限，請調整後再結帳`, 'error');
      return;
    }

    const overStockItems = cart.items.filter((i) => {
      if (i.quantity < 0) return false;
      return exceedsLoginStoreQuantity(i.quantity, i.loginStoreQuantity);
    });

    if (overStockItems.length > 0) {
      showToast(
        `提醒：清單中有 ${overStockItems.length} 項商品超過本門市可售數量，出單後該庫存點可能變成負數。`,
        'warning'
      );
    }
    setIsPaymentOpen(true);
  };

  const handleViewCartItemDetail = async (productId: string) => {
    if (detailLock.current) return;
    detailLock.current = true;
    setDetailBusyId(productId);
    try {
      const product = await productService.getProductById(productId);
      if (product) {
        setDetailProduct(product);
      } else {
        const item = cart.items.find((i) => i.productId === productId);
        if (item) {
          setDetailProduct({
            id: item.productId,
            sku: item.sku,
            normalizedSku: item.sku.replace(/-/g, ''),
            barcode: item.barcode || '',
            name: item.name,
            brand: item.brand,
            scale: item.scale,
            spec: item.spec,
            listPrice: item.originalPrice,
            inventories: [],
            totalInventory: item.totalInventory ?? 0,
            loginStoreQuantity: item.loginStoreQuantity ?? null,
            loginStoreReturnedQuantity: item.loginStoreReturnedQuantity ?? null,
          });
        }
      }
    } finally {
      detailLock.current = false;
      setDetailBusyId(null);
    }
  };

  const handleViewReturnOriginalOrder = async (item: (typeof cart.items)[number]) => {
    if (returnLock.current) return;
    returnLock.current = true;
    const busyKey = `${item.productId}:${item.originalOrderId ?? 'none'}`;
    setReturnBusyKey(busyKey);
    try {
      if (item.originalOrderId) {
        try {
          const originalOrder = await checkoutService.getOrderById(item.originalOrderId);
          if (originalOrder) {
            setInspectedOrder(originalOrder);
            setInspectedReturnItem(item);
            return;
          }
        } catch (err) {
          console.error('Failed to fetch original order:', err);
        }
        showToast(
          item.originalOrderNumber ? `查無原始訂單（${item.originalOrderNumber}）之資料` : '查無原始訂單資料',
          'warning'
        );
      }
      setReturnModalPrefill({ productId: item.productId, keyword: item.sku });
      setIsReturnModalOpen(true);
    } finally {
      returnLock.current = false;
      setReturnBusyKey(null);
    }
  };

  return (
    /* 依需求 1：擴大右半邊 (待結帳清單) 為主要操作區 (比例改為 38fr : 62fr) */
    <div className="grid h-full grid-cols-[38fr_62fr] gap-4">
      {/* 左欄：商品速查與廠牌篩選 */}
      <section className="flex flex-col gap-2.5 overflow-hidden pr-1 h-full min-h-0">
        <ProductSearchBar
          ref={searchInputRef}
          keyword={keyword}
          onKeywordChange={setKeyword}
          brand={brand}
          onBrandChange={setBrand}
          onEnter={() => void handleSearchSubmit()}
        />

        <div className="flex-1 min-h-0 flex flex-col">
          <ProductResultTable
            results={results}
            isLoading={isLoading}
            onAdd={handleAddProduct}
            onViewDetail={(product) => {
              setDetailSource('catalog');
              setDetailProduct(product);
            }}
            onCreateNew={() => {
              ui.openProductCreateModal(keyword.trim());
              ui.setActiveTab('inventory');
            }}
          />
          {!isLoading && (
            <LoadMoreFooter
              shown={results.length}
              total={total}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={() => void loadMore()}
            />
          )}
        </div>
      </section>

      {/* 右欄：當前待結帳單、會員綁定、運費與結帳操作 (主要操作區) */}
      <section className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 overflow-hidden">
        {/* 購物車與退貨區塊 container */}
        <div className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto pr-1 space-y-2.5">
          {/* 上半部：銷售商品清單與整體清單區塊 (點擊任意處退出退貨模式) */}
          <div
            onClick={() => {
              if (isReturnMode) setIsReturnMode(false);
            }}
            className={`flex-1 space-y-2 rounded-xl border p-2.5 transition-all cursor-pointer ${isReturnMode
                ? 'bg-zinc-950/40 border-dashed border-zinc-700/60 opacity-85 hover:opacity-100'
                : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
              }`}
            title={isReturnMode ? '點擊此區退出退貨模式' : undefined}
          >
            {/* 待結清單 Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5 px-1">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${!isReturnMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-zinc-400'
                    }`}
                >
                  🛒
                </span>
                <span className={`font-bold text-sm ${!isReturnMode ? 'text-zinc-100' : 'text-zinc-400'}`}>
                  待結商品清單
                </span>
                <span className="text-xs text-cyan-400 font-mono font-semibold">
                  ({formatQuantity(salesQuantity, salesItems.length)})
                </span>
              </div>

              {salesItems.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-300">
                    小計 {formatCurrency(salesSubtotal)}
                  </span>
                </div>
              ) : isReturnMode ? (
                <span className="text-xs text-zinc-400 font-medium">
                  點擊此區可切回銷售模式
                </span>
              ) : null}
            </div>

            {salesItems.length === 0 && returnItems.length === 0 ? (
              <div className="flex h-36 flex-col items-center justify-center text-center text-zinc-500 py-6">
                <p className="text-xs">目前無待結品項，請點擊左側商品或掃描條碼加入</p>
              </div>
            ) : salesItems.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-xs border border-dashed border-zinc-800/80 rounded-lg select-none">
                （目前尚無售出商品，點擊此區可離開退貨模式並加入一般銷售品項）
              </div>
            ) : (
              <div className="space-y-0.5">
                {salesItems.map((item, idx) => {
                  const siblingProducts = item.barcode ? siblingsByBarcode[item.barcode] ?? [] : [];
                  const isPointsLine = Boolean(item.pointsDiscountApplied);
                  const productRedeemed = salesItems.some(
                    (other) => other.productId === item.productId && other.pointsDiscountApplied
                  );
                  const pointsDisabledReason = isPointsLine
                    ? undefined
                    : !cart.attachedCustomer
                      ? '需綁定會員'
                      : productRedeemed
                        ? '此商品已折抵'
                        : undefined;

                  return (
                    <UnavailableCartLine
                      key={`sales-${item.productId}-${isPointsLine ? 'points' : 'plain'}-${idx}`}
                      reason={unavailableReason(item, unavailable)}
                      onRemove={() => cart.removeItem(item.productId, isPointsLine)}
                    >
                      <CartItemRow
                        item={item}
                        index={idx + 1}
                        siblingProducts={siblingProducts}
                        onSwitchSku={(newP) => cart.switchItemSku(item.productId, newP)}
                        onUpdateQuantity={(q) => handleUpdateQuantity(item, q)}
                        onUpdatePrice={(p) => cart.updateItemPrice(item.productId, p, '現場改價')}
                        onRemove={() => cart.removeItem(item.productId, isPointsLine)}
                        pointsDiscount={{
                          applied: isPointsLine,
                          disabledReason: pointsDisabledReason,
                          onToggle: (applied) => {
                            cart.setPointsDiscount(item.productId, applied);
                            focusBarcode();
                          },
                        }}
                        preorderPickup={{
                          checked: Boolean(item.preorderPickup),
                          onToggle: (checked) => {
                            cart.setPreorderPickup(item.productId, isPointsLine, checked);
                            focusBarcode();
                          },
                        }}
                        busy={detailBusyId === item.productId}
                        onViewDetail={() => {
                          setDetailSource('cart');
                          void handleViewCartItemDetail(item.productId);
                        }}
                      />
                    </UnavailableCartLine>
                  );
                })}
              </div>
            )}
          </div>

          {/* 固定在列表最下方的退貨清單區塊 (點擊進入/維持退貨模式) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!isReturnMode) setIsReturnMode(true);
            }}
            className={`rounded-xl border p-2.5 space-y-2 transition-all cursor-pointer ${isReturnMode
                ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500/50 shadow-lg shadow-rose-950/50'
                : 'border-zinc-800 bg-zinc-950/60 hover:border-rose-900/60'
              }`}
          >
            {/* 退貨區塊 Header */}
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-1.5 px-1">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${isReturnMode ? 'bg-rose-500 text-white animate-pulse' : 'bg-rose-500/20 text-rose-300'
                    }`}
                >
                  ↩️
                </span>
                <span className="font-bold text-rose-200 text-sm">
                  瑕疵退貨 / 換貨折抵清單
                </span>
                {isReturnMode && (
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-xs font-bold text-rose-300 animate-pulse border border-rose-500/40">
                    🔴 退貨模式中
                  </span>
                )}
                <span className="text-xs text-rose-400 font-mono font-semibold">
                  ({formatQuantity(returnQuantity, returnItems.length)})
                </span>
              </div>

              {returnItems.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-rose-400">
                    折抵小計 {formatCurrency(returnSubtotal)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsReturnModalOpen(true);
                    }}
                    className="rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs px-2 py-0.5 border border-rose-700 font-bold transition-all shadow-sm"
                  >
                    查原單退貨
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium">
                    {isReturnMode ? '點擊上方銷售區可離開退貨模式' : '點擊此區進入退貨模式'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsReturnModalOpen(true);
                    }}
                    className="rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs px-2 py-0.5 border border-rose-700 font-bold transition-all shadow-sm"
                  >
                    查原單退貨
                  </button>
                </div>
              )}
            </div>

            {/* 退貨品項明細 */}
            {returnItems.length > 0 ? (
              <div className="space-y-1">
                {returnItems.map((item, idx) => (
                  <UnavailableCartLine
                    key={`return-${item.productId}-${item.originalOrderId ?? 'return'}-${idx}`}
                    reason={unavailableReason(item, unavailable)}
                    onRemove={() => cart.removeItem(item.productId)}
                  >
                    <ReturnCartItemRow
                      item={item}
                      index={idx + 1}
                      onUpdateQuantity={(q) => handleUpdateQuantity(item, q)}
                      onUpdatePrice={(p) => cart.updateItemPrice(item.productId, p, '瑕疵退貨改價')}
                      onRemove={() => cart.removeItem(item.productId)}
                      busy={returnBusyKey === `${item.productId}:${item.originalOrderId ?? 'none'}`}
                      onViewDetail={() => {
                        void handleViewReturnOriginalOrder(item);
                      }}
                    />
                  </UnavailableCartLine>
                ))}
              </div>
            ) : (
              <div className="py-2 px-1 text-center text-xs text-rose-400/80 font-medium select-none flex items-center justify-center gap-2">
                <span>點擊【查原單退貨】或進入退貨模式挑選品項</span>
              </div>
            )}
          </div>
        </div>

        {/* 會員綁定卡片 (含搜尋框，移至退貨清單之後、商品小計之前) */}
        <div className="mt-2.5">
          <CustomerBindCard />
        </div>

        {/* 待結統計與按鈕 (依需求 10：傳遞銷售件數與退貨件數分開統計) */}
        <CartSummary
          originalTotal={breakdown.originalTotal}
          salesOriginalTotal={salesBreakdown.originalTotal}
          returnOriginalTotal={returnBreakdown.originalTotal}
          priceAdjustment={breakdown.priceAdjustment}
          pointsDiscount={breakdown.pointsDiscount}
          shippingFee={cart.shippingFee}
          onShippingFeeChange={cart.setShippingFee}
          totalAmount={totalAmount}
          itemCount={cart.items.length}
          salesItemCount={cart.getSalesItemsCount()}
          returnItemCount={cart.getReturnItemsCount()}
          onClear={() => {
            // 收銀員主動清空購物車，代表放棄這筆結帳，下一筆一定用新 key。
            clearCheckoutKey();
            cart.clearCart();
          }}
          onCheckout={() => {
            void handleStartCheckout();
          }}
        />
      </section>

      {/* 付款與收銀 Modal */}
      {(() => {
        const overStockList = cart.items
          .filter((i) => i.quantity > 0 && exceedsLoginStoreQuantity(i.quantity, i.loginStoreQuantity))
          .map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            loginStoreQuantity: i.loginStoreQuantity ?? null,
            loginStoreReturnedQuantity: i.loginStoreReturnedQuantity ?? null,
          }));

        return (
          <PaymentModal
            open={isPaymentOpen}
            onClose={() => {
              if (isSubmitting) return;
              setIsPaymentOpen(false);
              focusBarcode();
            }}
            totalAmount={totalAmount}
            isSubmitting={isSubmitting}
            hasOverStockItems={overStockList.length > 0}
            overStockItemsList={overStockList}
            onConfirm={async (payments) => {
              const result = await submitCheckout(payments);
              if (result) {
                setIsPaymentOpen(false);
              }
            }}
          />
        );
      })()}

      {/* 辦理退換貨（選擇原始售出單據）Modal */}
      <ReturnOrderModal
        open={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setReturnModalPrefill({});
          focusBarcode();
        }}
        prefillProductId={returnModalPrefill.productId}
        prefillKeyword={returnModalPrefill.keyword}
      />

      {/* 原始銷售單據完整明細 Modal */}
      <OrderDetailModal
        open={Boolean(inspectedOrder)}
        order={inspectedOrder}
        currentReturnItem={inspectedReturnItem}
        onClose={() => {
          setInspectedOrder(null);
          setInspectedReturnItem(null);
          focusBarcode();
        }}
        onSelectAnotherOrder={() => {
          if (inspectedReturnItem) {
            setReturnModalPrefill({
              productId: inspectedReturnItem.productId,
              keyword: inspectedReturnItem.sku,
            });
          }
          setInspectedOrder(null);
          setInspectedReturnItem(null);
          setIsReturnModalOpen(true);
        }}
        onViewReceipt={(ord) => {
          setReceipt({ order: ord });
        }}
      />

      {/* 收據 Modal */}
      <ReceiptModal
        receipt={receipt}
        onClose={() => {
          setReceipt(null);
          focusBarcode();
        }}
      />

      {/* 商品詳情 Modal */}
      <ProductDetailModal
        open={Boolean(detailProduct)}
        product={detailProduct}
        onClose={() => {
          setDetailProduct(null);
          focusBarcode();
        }}
        onAddToCart={
          detailSource === 'catalog'
            ? (p) => {
              handleAddProduct(p);
              setDetailProduct(null);
            }
            : undefined
        }
      />
    </div>
  );
}
