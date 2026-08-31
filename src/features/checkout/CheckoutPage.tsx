import { useRef, useState } from 'react';
import { useProductSearch } from './hooks/useProductSearch';
import { useCheckoutWorkflow } from './hooks/useCheckoutWorkflow';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ProductSearchBar } from './components/ProductSearchBar';
import { ProductResultTable } from './components/ProductResultTable';
import { CartItemRow, ReturnCartItemRow } from './components/CartItemRow';
import { CartSummary } from './components/CartSummary';
import { CustomerBindCard } from './components/CustomerBindCard';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { productService, preOrderService } from '@/services';
import { formatCurrency } from '@/utils/currency';
import type { Product } from '@/types/product';

export function CheckoutPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { keyword, setKeyword, brand, setBrand, results, isLoading } = useProductSearch();
  const cart = useCartStore();
  const ui = useUiStore();
  const showToast = useToastStore((s) => s.showToast);
  const { isSubmitting, receipt, setReceipt, submitCheckout } = useCheckoutWorkflow();
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailSource, setDetailSource] = useState<'catalog' | 'cart' | 'overstock'>('catalog');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReturnMode, setIsReturnMode] = useState(false);

  const salesItems = cart.items.filter((i) => i.quantity > 0);
  const returnItems = cart.items.filter((i) => i.quantity < 0);

  const salesSubtotal = salesItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const returnSubtotal = returnItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const subtotal = cart.getSubtotal();
  const discount = cart.items.reduce((sum, i) => sum + (i.originalPrice - i.unitPrice) * i.quantity, 0);
  const totalAmount = cart.getTotalAmount();

  const handleConvertToPreOrder = async () => {
    if (!cart.attachedCustomer) {
      showToast('轉成預購單需先綁定會員', 'warning');
      return;
    }
    if (cart.items.length === 0) {
      showToast('購物車內無商品可建立預購單', 'warning');
      return;
    }
    if (cart.items.some((i) => Boolean(i.preOrderId))) {
      showToast('購物車內含有帶入之預購提貨品項，無法再轉換為預購單', 'warning');
      return;
    }

    const targetCustomer = cart.attachedCustomer;
    const today = new Date().toISOString().split('T')[0];
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    try {
      const created = await preOrderService.createPreOrder({
        orderNumber: `PO-${today.replace(/-/g, '').slice(0, 6)}-${randomNum}`,
        customerId: targetCustomer.id,
        customerName: targetCustomer.name,
        customerPhone: targetCustomer.phone,
        orderDate: today,
        source: 'in_store',
        operatorName: '店長 Fred',
        items: cart.items.map((item) => ({
          id: `poi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: item.productId,
          sku: item.sku,
          productName: item.name,
          scale: item.scale,
          brand: item.brand,
          quotedPrice: item.unitPrice,
          qtyOrdered: item.quantity,
          qtyArrived: 0,
          qtyDelivered: 0,
        })),
        note: '結帳櫃檯轉為預購單',
      });

      showToast(
        `已成功將購物車商品轉為會員【${targetCustomer.name}】之預購單 (${created.orderNumber})！`,
        'success'
      );
      cart.clearCart();
      ui.navigateToCustomer(targetCustomer.id);
    } catch (err) {
      console.error(err);
      showToast('轉為預購單失敗', 'error');
    }
  };

  useKeyboardShortcuts({
    onFocusSearch: () => searchInputRef.current?.focus(),
    onOpenPreOrderDrawer: () => ui.openPreOrderDrawer(),
    onOpenPayment: () => cart.items.length > 0 && setIsPaymentOpen(true),
    onEscape: () => {
      ui.closeAllOverlays();
      setIsPaymentOpen(false);
      setDetailProduct(null);
    },
  });

  const handleAddProduct = (product: Product) => {
    if (isReturnMode) {
      cart.addItem(product, -1);
      showToast(`已於【退貨模式】新增瑕疵退貨品項：${product.name}`, 'info');
      return;
    }

    const storeStock = product.stocks.find((s) => s.location === 'store')?.quantity ?? 0;
    const reservedPreOrder = product.preOrderPendingCount ?? 0;
    const sellableTotal = Math.max(0, product.totalStock - reservedPreOrder);

    const existing = cart.items.find((i) => i.productId === product.id && !i.preOrderId && i.quantity > 0);
    const newQty = (existing?.quantity ?? 0) + 1;

    if (newQty > sellableTotal) {
      showToast(
        `警示：「${product.name}」結帳數量 (${newQty}台) 超過全店可售總存量 (${sellableTotal}台，總現貨: ${product.totalStock}台，預購保留: ${reservedPreOrder}台)`,
        'warning'
      );
    } else if (newQty > storeStock) {
      showToast(
        `提醒：「${product.name}」門市現貨僅 ${storeStock} 台 (全店總可售 ${sellableTotal} 台)，結帳出單後需自倉庫調撥`,
        'warning'
      );
    }
    cart.addItem(product, 1);
  };

  const handleUpdateQuantity = (item: (typeof cart.items)[number], newQty: number) => {
    if (!item.preOrderId && newQty > 0) {
      const storeStock = item.storeStock ?? 0;
      const totalStock = item.totalStock ?? storeStock;
      const reservedPreOrder = item.preOrderPendingCount ?? 0;
      const sellableTotal = Math.max(0, totalStock - reservedPreOrder);

      if (newQty > sellableTotal) {
        showToast(
          `警示：「${item.name}」數量 (${newQty}台) 超過全店扣除預購保留後之可售現貨 (${sellableTotal}台)，需緊急進貨`,
          'warning'
        );
      } else if (newQty > storeStock) {
        showToast(
          `提醒：「${item.name}」數量 (${newQty}台) 超過門市現貨 (${storeStock}台)，需自倉庫調撥`,
          'warning'
        );
      }
    }
    cart.updateItemQuantity(item.productId, newQty);
  };

  const handleStartCheckout = () => {
    const overStockItems = cart.items.filter((i) => {
      if (i.preOrderId || i.quantity < 0) return false;
      const storeStock = i.storeStock ?? 0;
      const totalStock = i.totalStock ?? storeStock;
      const reserved = i.preOrderPendingCount ?? 0;
      const sellableTotal = Math.max(0, totalStock - reserved);
      return i.quantity > storeStock || i.quantity > sellableTotal;
    });

    if (overStockItems.length > 0) {
      showToast(
        `提醒：清單中有 ${overStockItems.length} 項商品需調撥或超過總可售現貨，出單前請確認！`,
        'warning'
      );
    }
    setIsPaymentOpen(true);
  };

  const handleViewCartItemDetail = async (productId: string) => {
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
          barcode: '',
          name: item.name,
          brand: item.brand,
          scale: item.scale,
          listPrice: item.originalPrice,
          costPrice: 0,
          vipPrice: item.vipPrice,
          totalStock: item.storeStock ?? 0,
          stocks: [
            { location: 'store', locationName: '門市現貨', quantity: item.storeStock ?? 0 },
            { location: 'warehouse', locationName: '後方倉庫', quantity: 0 },
            { location: 'company', locationName: '公司總倉', quantity: 0 },
          ],
          status: 'active',
          preOrderPendingCount: 0,
          createdAt: new Date().toISOString(),
        } as unknown as Product);
      }
    }
  };

  return (
    <div className="grid h-full grid-cols-[58fr_42fr] gap-5">
      {/* 左欄：商品速查與廠牌篩選 */}
      <section className="flex flex-col gap-3 overflow-hidden pr-1 h-full min-h-0">
        <ProductSearchBar
          ref={searchInputRef}
          keyword={keyword}
          onKeywordChange={setKeyword}
          brand={brand}
          onBrandChange={setBrand}
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
            onCreateNew={() => showToast('新商品建檔功能請至「商品及庫存」頁面', 'info')}
          />
        </div>
      </section>

      {/* 右欄：會員綁定、當前結帳單、運費與結帳操作 */}
      <section className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 overflow-hidden">
        <CustomerBindCard />

        {/* 購物車與退貨區塊 container */}
        <div className="mt-2.5 flex-1 flex flex-col justify-between overflow-y-auto pr-1 space-y-3">
          {/* 上半部：銷售商品清單與整體清單區塊 (點擊任意處退出退貨模式) */}
          <div
            onClick={() => {
              if (isReturnMode) setIsReturnMode(false);
            }}
            className={`flex-1 space-y-2 rounded-xl p-2 transition-all cursor-pointer ${
              isReturnMode
                ? 'bg-zinc-950/40 border border-dashed border-zinc-700/60 opacity-85 hover:opacity-100'
                : 'border border-transparent'
            }`}
            title={isReturnMode ? '點擊此區退出退貨模式' : undefined}
          >
            {salesItems.length === 0 && returnItems.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center text-zinc-500 py-8">
                <p className="text-3xl">🛒</p>
                <p className="mt-2 text-xs">目前無待結品項，請點擊左側商品或掃描條碼加入</p>
              </div>
            ) : salesItems.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg select-none">
                （目前尚無售出商品，點擊此區可離開退貨模式並加入一般銷售品項）
              </div>
            ) : (
              <div className="space-y-0.5">
                {salesItems.map((item, idx) => (
                  <CartItemRow
                    key={`${item.productId}-${item.preOrderItemId ?? 'direct'}`}
                    item={item}
                    index={idx + 1}
                    onUpdateQuantity={(q) => handleUpdateQuantity(item, q)}
                    onUpdatePrice={(p) => cart.updateItemPrice(item.productId, p, '現場改價')}
                    onRemove={() => cart.removeItem(item.productId)}
                    onViewDetail={() => {
                      setDetailSource('cart');
                      handleViewCartItemDetail(item.productId);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 固定在列表最下方的退貨清單區塊 (點擊進入/維持退貨模式) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!isReturnMode) setIsReturnMode(true);
            }}
            className={`rounded-xl border p-2.5 space-y-2 transition-all cursor-pointer ${
              isReturnMode
                ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500/50 shadow-lg shadow-rose-950/50'
                : 'border-zinc-800 bg-zinc-950/60 hover:border-rose-900/60'
            }`}
          >
            {/* 退貨區塊 Header */}
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-1.5 px-1">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                    isReturnMode ? 'bg-rose-500 text-white animate-pulse' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  ↩️
                </span>
                <span className="font-bold text-rose-200 text-sm">
                  {isReturnMode ? '🔴 退貨模式中（加入商品將列為退貨）' : '瑕疵退貨 / 換貨折抵清單'}
                </span>
                {returnItems.length > 0 && (
                  <span className="text-xs text-rose-400 font-mono">({returnItems.length} 項)</span>
                )}
              </div>

              {returnItems.length > 0 ? (
                <span className="font-mono text-sm font-bold text-rose-400">
                  折抵小計 {formatCurrency(returnSubtotal)}
                </span>
              ) : (
                <span className="text-xs text-zinc-400 font-medium">
                  {isReturnMode ? '點擊上方銷售區可離開退貨模式' : '點擊此區進入退貨模式'}
                </span>
              )}
            </div>

            {/* 退貨品項明細 */}
            {returnItems.length > 0 ? (
              <div className="space-y-1">
                {returnItems.map((item, idx) => (
                  <ReturnCartItemRow
                    key={`${item.productId}-${item.preOrderItemId ?? 'direct'}`}
                    item={item}
                    index={idx + 1}
                    onUpdateQuantity={(q) => handleUpdateQuantity(item, q)}
                    onUpdatePrice={(p) => cart.updateItemPrice(item.productId, p, '瑕疵退貨改價')}
                    onRemove={() => cart.removeItem(item.productId)}
                    onViewDetail={() => {
                      setDetailSource('cart');
                      handleViewCartItemDetail(item.productId);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-2 px-1 text-center text-xs text-rose-400/80 font-medium select-none">
                {isReturnMode
                  ? '⬅️ 正在退貨模式中！請點擊左側商品新增瑕疵退貨項目'
                  : '點擊此處進入【退貨模式】，加入的商品將直接列為退貨'}
              </div>
            )}
          </div>
        </div>

        <CartSummary
          subtotal={subtotal}
          salesSubtotal={salesSubtotal}
          returnSubtotal={returnSubtotal}
          discount={discount}
          shippingFee={cart.shippingFee}
          onShippingFeeChange={cart.setShippingFee}
          totalAmount={totalAmount}
          itemCount={cart.items.length}
          boundCustomerName={cart.attachedCustomer?.name}
          hasPreOrderItems={cart.items.some((i) => Boolean(i.preOrderId))}
          onClear={cart.clearCart}
          onCheckout={handleStartCheckout}
          onConvertToPreOrder={handleConvertToPreOrder}
        />
      </section>

      {/* 付款與收銀 Modal */}
      {(() => {
        const overStockList = cart.items
          .filter((i) => {
            if (i.preOrderId || i.quantity < 0) return false;
            const storeStock = i.storeStock ?? 0;
            const totalStock = i.totalStock ?? storeStock;
            const reserved = i.preOrderPendingCount ?? 0;
            const sellableTotal = Math.max(0, totalStock - reserved);
            return i.quantity > storeStock || i.quantity > sellableTotal;
          })
          .map((i) => {
            const storeStock = i.storeStock ?? 0;
            const totalStock = i.totalStock ?? storeStock;
            const reserved = i.preOrderPendingCount ?? 0;
            const available = Math.max(0, totalStock - reserved);
            return {
              productId: i.productId,
              name: i.name,
              quantity: i.quantity,
              storeStock,
              totalStock,
              preOrderReserved: reserved,
              available,
            };
          });

        return (
          <PaymentModal
            open={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            totalAmount={totalAmount}
            isSubmitting={isSubmitting}
            hasOverStockItems={overStockList.length > 0}
            overStockItemsList={overStockList}
            onConfirm={(payments, invoice) => {
              setIsPaymentOpen(false);
              submitCheckout(payments, invoice);
            }}
            onViewProductDetail={(productId) => {
              handleViewCartItemDetail(productId);
            }}
          />
        );
      })()}

      {/* 收據 Modal */}
      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />

      {/* 商品詳情 Modal */}
      <ProductDetailModal
        open={Boolean(detailProduct)}
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
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
