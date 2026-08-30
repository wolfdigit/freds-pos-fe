import { useRef, useState } from 'react';
import { useProductSearch } from './hooks/useProductSearch';
import { useCheckoutWorkflow } from './hooks/useCheckoutWorkflow';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ProductSearchBar } from './components/ProductSearchBar';
import { ProductResultTable } from './components/ProductResultTable';
import { CartItemRow } from './components/CartItemRow';
import { CartSummary } from './components/CartSummary';
import { CustomerBindCard } from './components/CustomerBindCard';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { productService, preOrderService } from '@/services';
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
    const storeStock = product.stocks.find((s) => s.location === 'store')?.quantity ?? 0;
    const reservedPreOrder = product.preOrderPendingCount ?? 0;
    // 預購保留扣減在總現貨
    const sellableTotal = Math.max(0, product.totalStock - reservedPreOrder);

    const existing = cart.items.find((i) => i.productId === product.id && !i.preOrderId);
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
    cart.addItem(product);
  };

  const handleUpdateQuantity = (item: (typeof cart.items)[number], newQty: number) => {
    if (!item.preOrderId) {
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
      if (i.preOrderId) return false;
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
    // 警示但不阻擋結帳流程
    setIsPaymentOpen(true);
  };

  const handleViewCartItemDetail = async (productId: string) => {
    const product = await productService.getProductById(productId);
    if (product) {
      setDetailProduct(product);
    } else {
      // 若是預購品項或其他，以購物車品項基本資訊展示
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
        <div className="mt-2.5 flex-1 overflow-y-auto pr-1">
          {cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500 py-12">
              <p className="text-3xl">🛒</p>
              <p className="mt-2 text-xs">目前無待結品項，請點擊左側商品或掃描條碼加入</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {cart.items.map((item, idx) => (
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
        <CartSummary
          subtotal={subtotal}
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
            if (i.preOrderId) return false;
            const storeStock = i.storeStock ?? 0;
            const totalStock = i.totalStock ?? storeStock;
            const reserved = i.preOrderPendingCount ?? 0;
            const availableTotal = Math.max(0, totalStock - reserved);
            return i.quantity > storeStock || i.quantity > availableTotal;
          })
          .map((i) => {
            const storeStock = i.storeStock ?? 0;
            const totalStock = i.totalStock ?? storeStock;
            const reserved = i.preOrderPendingCount ?? 0;
            const availableTotal = Math.max(0, totalStock - reserved);
            return {
              productId: i.productId,
              name: i.name,
              quantity: i.quantity,
              storeStock,
              totalStock,
              preOrderReserved: reserved,
              available: availableTotal,
            };
          });

        return (
          <PaymentModal
            open={isPaymentOpen}
            totalAmount={totalAmount}
            isSubmitting={isSubmitting}
            hasOverStockItems={overStockList.length > 0}
            overStockItemsList={overStockList}
            onClose={() => setIsPaymentOpen(false)}
            onViewProductDetail={(productId) => {
              setDetailSource('overstock');
              handleViewCartItemDetail(productId);
            }}
            onConfirm={async (payments, invoice) => {
              const result = await submitCheckout(payments, invoice);
              if (result) setIsPaymentOpen(false);
            }}
          />
        );
      })()}

      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
      <ProductDetailModal
        open={Boolean(detailProduct)}
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddProduct}
        showAddToCart={detailSource === 'catalog'}
        zIndexClassName="z-[70]"
      />
    </div>
  );
}
