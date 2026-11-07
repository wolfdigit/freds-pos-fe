import { getBoundCartUserId, setBoundCartUserId } from '@/auth/cartOwner';
import { useCartStore, type CartItem } from '@/store/cartStore';
import type { Customer } from '@/types/customer';

export const LEGACY_CART_STORAGE_KEY = 'FREDS_POS_CART';

export interface PersistedCart {
  items: CartItem[];
  attachedCustomer: Customer | null;
  shippingFee: number;
  orderNote: string;
}

const EMPTY_CART: PersistedCart = {
  items: [],
  attachedCustomer: null,
  shippingFee: 0,
  orderNote: '',
};

let suppressSave = false;

export function cartStorageKey(userId: string): string {
  return `${LEGACY_CART_STORAGE_KEY}:${userId}`;
}

/** Deletes only the pre-login unowned cart. Per-account carts and other settings stay. */
export function clearLegacyUnownedCart(): void {
  localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
}

export function readPersistedCart(userId: string): PersistedCart {
  const raw = localStorage.getItem(cartStorageKey(userId));
  if (!raw) return { ...EMPTY_CART, items: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedCart>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      attachedCustomer: parsed.attachedCustomer ?? null,
      shippingFee: typeof parsed.shippingFee === 'number' ? parsed.shippingFee : 0,
      orderNote: typeof parsed.orderNote === 'string' ? parsed.orderNote : '',
    };
  } catch {
    return { ...EMPTY_CART, items: [] };
  }
}

export function writePersistedCart(userId: string, cart: PersistedCart): void {
  localStorage.setItem(cartStorageKey(userId), JSON.stringify(cart));
}

function snapshot(): PersistedCart {
  const state = useCartStore.getState();
  return {
    items: state.items,
    attachedCustomer: state.attachedCustomer,
    shippingFee: state.shippingFee,
    orderNote: state.orderNote,
  };
}

function replaceMemory(cart: PersistedCart): void {
  useCartStore.setState({
    items: cart.items,
    attachedCustomer: cart.attachedCustomer,
    shippingFee: cart.shippingFee,
    orderNote: cart.orderNote,
    highlightedProductId: null,
  });
}

export function bindCartToUser(userId: string | null): void {
  suppressSave = true;
  setBoundCartUserId(null);
  replaceMemory(EMPTY_CART);
  setBoundCartUserId(userId);
  if (userId) {
    replaceMemory(readPersistedCart(userId));
  }
  suppressSave = false;
}

export function handleCartStorageEvent(event: StorageEvent): void {
  const boundUserId = getBoundCartUserId();
  if (!boundUserId || event.key !== cartStorageKey(boundUserId)) return;
  suppressSave = true;
  if (!event.newValue) {
    replaceMemory(EMPTY_CART);
  } else {
    try {
      const parsed = JSON.parse(event.newValue) as Partial<PersistedCart>;
      replaceMemory({
        items: Array.isArray(parsed.items) ? parsed.items : [],
        attachedCustomer: parsed.attachedCustomer ?? null,
        shippingFee: typeof parsed.shippingFee === 'number' ? parsed.shippingFee : 0,
        orderNote: typeof parsed.orderNote === 'string' ? parsed.orderNote : '',
      });
    } catch {
      replaceMemory(EMPTY_CART);
    }
  }
  suppressSave = false;
}

useCartStore.subscribe((state, previous) => {
  const boundUserId = getBoundCartUserId();
  if (suppressSave || !boundUserId) return;
  if (
    state.items === previous.items &&
    state.attachedCustomer === previous.attachedCustomer &&
    state.shippingFee === previous.shippingFee &&
    state.orderNote === previous.orderNote
  ) {
    return;
  }
  writePersistedCart(boundUserId, snapshot());
});
