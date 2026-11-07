import { bindCartToUser, clearLegacyUnownedCart } from '@/auth/cartPersistence';
import { isMockService } from '@/services';
import { useSessionStore } from '@/store/sessionStore';

/** Runs before the first render. Legacy unowned carts are removed; mock mode binds the demo cashier. */
export function bootstrapClientState(): void {
  clearLegacyUnownedCart();
  if (isMockService) {
    bindCartToUser(useSessionStore.getState().cashierId || 'staff-001');
    return;
  }
  bindCartToUser(null);
}
