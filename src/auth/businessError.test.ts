import { describe, expect, it } from 'vitest';
import { errorDetail, isSessionEnd, readBusinessError, readValidationMessage } from './businessError';

describe('backend auth error envelope', () => {
  it('reads { code, message } and does not invent a wrapper', () => {
    expect(readBusinessError({ code: 'AUTH_STORE_INVALID', message: '門市不存在' })).toEqual({
      code: 'AUTH_STORE_INVALID',
      message: '門市不存在',
    });
    expect(readBusinessError({ detail: [{ msg: 'field required' }] })).toEqual({ code: null, message: null });
  });

  it('reads validation text that is not a business error envelope', () => {
    expect(readValidationMessage({ detail: [{ msg: 'field required' }] })).toBe('field required');
    expect(readValidationMessage({
      errors: { Name: ['The field Name must be a string with a maximum length of 64.'] },
    })).toBe('The field Name must be a string with a maximum length of 64.');
  });

  it('prefers the validation body over a generic HTTP wrapper and keeps the code', () => {
    const err = Object.assign(new Error('API 請求失敗 (400)：/inventory/locations/loc'), {
      code: 'INVENTORY_LOCATION_IN_USE',
      responseBody: { code: 'INVENTORY_LOCATION_IN_USE', message: '門市仍綁定此庫存點' },
    });
    expect(errorDetail(err, '刪除地點失敗')).toBe('門市仍綁定此庫存點（INVENTORY_LOCATION_IN_USE）');
  });

  it('ends the session only for the 401 session codes', () => {
    expect(isSessionEnd(401, 'AUTH_REQUIRED')).toBe(true);
    expect(isSessionEnd(401, 'AUTH_SESSION_EXPIRED')).toBe(true);
    expect(isSessionEnd(401, 'AUTH_SESSION_REVOKED')).toBe(true);
    expect(isSessionEnd(401, 'AUTH_ACCOUNT_NOT_ALLOWED')).toBe(true);
    expect(isSessionEnd(401, 'AUTH_INVALID_CREDENTIAL')).toBe(false);
    expect(isSessionEnd(403, 'AUTH_ACCOUNT_NOT_ALLOWED')).toBe(false);
    expect(isSessionEnd(403, 'AUTH_FORBIDDEN')).toBe(false);
    expect(isSessionEnd(403, 'AUTH_STORE_REQUIRED')).toBe(false);
    expect(isSessionEnd(409, 'ACCOUNT_LAST_ADMIN')).toBe(false);
    expect(isSessionEnd(409, 'ACCOUNT_SELF_PROTECTED')).toBe(false);
    expect(isSessionEnd(503, 'AUTH_NOT_CONFIGURED')).toBe(false);
  });
});
