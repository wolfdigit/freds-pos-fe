export type BusinessErrorCode =
  | 'INSUFFICIENT_STORE_STOCK'
  | 'RETURN_QTY_EXCEEDED'
  | 'INVALID_RETURN_CUSTOMER'
  | 'PAYMENT_INSUFFICIENT'
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_SKU_DUPLICATE'
  | 'CUSTOMER_NOT_FOUND'
  | 'CUSTOMER_PHONE_DUPLICATE'
  | 'CUSTOMER_EMAIL_DUPLICATE'
  | 'CUSTOMER_HAS_UNFINISHED_ORDERS'
  | 'ORDER_NOT_FOUND'
  | 'LOCATION_NOT_FOUND'
  | 'INVALID_LOCATION_TRANSFER'
  | 'TARGET_LOCATION_NOT_FOUND'
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
