export type BusinessErrorCode =
  | 'INSUFFICIENT_STORE_STOCK'
  | 'PREORDER_QTY_EXCEEDED'
  | 'PAYMENT_INSUFFICIENT'
  | 'PRODUCT_NOT_FOUND'
  | 'STORAGE_CORRUPTED';

export class BusinessError extends Error {
  constructor(
    public code: BusinessErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}
