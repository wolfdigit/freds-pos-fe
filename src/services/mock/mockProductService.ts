import type { IProductService } from '@/services/interfaces/IProductService';
import type { Product, ProductSearchParams, StockLocation } from '@/types/product';
import type {
  InventoryTransferRequest,
  StockAdjustRequest,
  BatchStockAdjustRequest,
  StockAdjustmentLog,
} from '@/types/inventory';
import { getProducts, setProducts, getStockLogs, addStockLog, simulateDelay } from './storageHelper';
import { isSkuMatch, normalizeSku } from '@/utils/skuNormalizer';
import { BusinessError } from '@/utils/errors';

function recalcTotalStock(product: Product): Product {
  return {
    ...product,
    totalStock: product.stocks.reduce((sum, s) => sum + s.quantity, 0),
  };
}

export class MockProductService implements IProductService {
  async searchProducts(params: ProductSearchParams): Promise<Product[]> {
    await simulateDelay();
    const products = getProducts();
    const keyword = params.keyword?.trim() ?? '';

    return products.filter((p) => {
      if (keyword) {
        const matchesSku = isSkuMatch(keyword, p.sku, p.barcode);
        const matchesName = p.name.toLowerCase().includes(keyword.toLowerCase());
        const matchesBrand = p.brand.toLowerCase().includes(keyword.toLowerCase());
        if (!matchesSku && !matchesName && !matchesBrand) return false;
      }
      if (params.scale && params.scale !== 'ALL' && p.scale !== params.scale) return false;
      if (params.brand && params.brand !== 'ALL' && p.brand !== params.brand) return false;
      if (params.inStockOnly && p.totalStock <= 0) return false;
      return true;
    });
  }

  async getProductById(id: string): Promise<Product | null> {
    await simulateDelay();
    const products = getProducts();
    return products.find((p) => p.id === id) ?? null;
  }

  async createProduct(
    product: Omit<Product, 'id' | 'totalStock' | 'preOrderPendingCount' | 'normalizedSku'>
  ): Promise<Product> {
    await simulateDelay();
    const products = getProducts();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      normalizedSku: normalizeSku(product.sku),
      preOrderPendingCount: 0,
      totalStock: 0,
    };
    const finalProduct = recalcTotalStock(newProduct);
    setProducts([...products, finalProduct]);
    return finalProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await simulateDelay();
    const products = getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new BusinessError('PRODUCT_NOT_FOUND', '找不到指定商品');

    const orig = products[idx];
    const updated: Product = {
      ...orig,
      ...updates,
      sku: updates.sku ? updates.sku.trim() : orig.sku,
      normalizedSku: updates.sku ? normalizeSku(updates.sku) : orig.normalizedSku,
    };

    const finalProduct = recalcTotalStock(updated);
    const nextProducts = [...products];
    nextProducts[idx] = finalProduct;
    setProducts(nextProducts);
    return finalProduct;
  }


  async transferStock(request: InventoryTransferRequest): Promise<boolean> {
    await simulateDelay();
    const products = getProducts();
    const idx = products.findIndex((p) => p.id === request.productId);
    if (idx === -1) throw new BusinessError('PRODUCT_NOT_FOUND', '找不到指定商品');

    const product = { ...products[idx], stocks: products[idx].stocks.map((s) => ({ ...s })) };
    const fromStock = product.stocks.find((s) => s.location === request.fromLocation);
    const toStock = product.stocks.find((s) => s.location === request.toLocation);

    if (!fromStock || !toStock) throw new BusinessError('PRODUCT_NOT_FOUND', '庫存地點不存在');
    if (fromStock.quantity < request.quantity) {
      throw new BusinessError('INSUFFICIENT_STORE_STOCK', `${fromStock.locationName} 庫存不足，無法調撥`);
    }

    fromStock.quantity -= request.quantity;
    toStock.quantity += request.quantity;

    const updated = recalcTotalStock(product);
    const nextProducts = [...products];
    nextProducts[idx] = updated;
    setProducts(nextProducts);
    return true;
  }

  async adjustStock(request: StockAdjustRequest): Promise<boolean> {
    await simulateDelay();
    const products = getProducts();
    const idx = products.findIndex((p) => p.id === request.productId);
    if (idx === -1) throw new BusinessError('PRODUCT_NOT_FOUND', '找不到指定商品');

    const product = { ...products[idx], stocks: products[idx].stocks.map((s) => ({ ...s })) };
    const stock = product.stocks.find((s) => s.location === request.location);
    if (!stock) throw new BusinessError('PRODUCT_NOT_FOUND', '庫存地點不存在');

    stock.quantity = request.newQuantity;

    const updated = recalcTotalStock(product);
    const nextProducts = [...products];
    nextProducts[idx] = updated;
    setProducts(nextProducts);
    return true;
  }

  async batchAdjustStock(request: BatchStockAdjustRequest): Promise<boolean> {
    await simulateDelay();
    const products = getProducts();
    const nextProducts = products.map((p) => ({ ...p, stocks: p.stocks.map((s) => ({ ...s })) }));

    let totalQtyChange = 0;

    for (const itemAdj of request.adjustments) {
      const idx = nextProducts.findIndex((p) => p.id === itemAdj.productId);
      if (idx === -1) continue;

      for (const change of itemAdj.changes) {
        const stockLoc = nextProducts[idx].stocks.find((s) => s.location === change.location);
        if (stockLoc) {
          stockLoc.quantity = change.newQty;
        }
        totalQtyChange += change.diff;
      }
      nextProducts[idx] = recalcTotalStock(nextProducts[idx]);
    }

    setProducts(nextProducts);

    const logRecord: StockAdjustmentLog = {
      id: `log-${Date.now()}`,
      timestamp: request.timestamp || new Date().toISOString(),
      operatorName: request.operatorName || 'Fred',
      items: request.adjustments,
      totalQtyChange,
      note: request.note,
    };
    addStockLog(logRecord);

    return true;
  }

  async getStockAdjustmentLogs(): Promise<StockAdjustmentLog[]> {
    await simulateDelay();
    return getStockLogs();
  }
}


export function deductStoreStock(products: Product[], productId: string, quantity: number): Product[] {
  return products.map((p) => {
    if (p.id !== productId) return p;
    const next = { ...p, stocks: p.stocks.map((s) => ({ ...s })) };
    const storeStock = next.stocks.find((s) => s.location === ('store' as StockLocation));
    if (storeStock) storeStock.quantity -= quantity;
    return recalcTotalStock(next);
  });
}
