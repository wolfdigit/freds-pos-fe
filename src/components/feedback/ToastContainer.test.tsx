import { afterEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastContainer } from './ToastContainer';
import { useToastStore } from './toastStore';

describe('ToastContainer focus', () => {
  afterEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('showing a toast and clicking it to dismiss keeps focus on the barcode input', () => {
    render(
      <>
        <input placeholder="掃描條碼" />
        <ToastContainer />
      </>
    );
    const input = screen.getByPlaceholderText('掃描條碼');
    input.focus();
    act(() => useToastStore.getState().showToast('無法讀取庫存點', 'error'));
    const toast = screen.getByText('無法讀取庫存點');
    expect(document.activeElement).toBe(input);
    expect(toast).not.toHaveAttribute('tabindex');

    // 瀏覽器在 mousedown 時讓輸入框失焦；提示要擋掉這個預設行為。
    const allowed = fireEvent.mouseDown(toast);
    expect(allowed).toBe(false);
    fireEvent.click(toast);
    expect(screen.queryByText('無法讀取庫存點')).toBeNull();
    expect(document.activeElement).toBe(input);
  });
});
