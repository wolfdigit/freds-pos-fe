import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUiStore } from '@/store/uiStore';
import { confirmDiscardUnsavedChanges, hasUnsavedChanges, setUnsavedChanges } from './unsavedChanges';

afterEach(() => {
  setUnsavedChanges(null);
  vi.restoreAllMocks();
  useUiStore.setState({ activeTab: null, selectedCustomerId: null });
});

describe('unsaved changes guard', () => {
  it('passes through when nothing is unsaved', () => {
    const confirm = vi.spyOn(window, 'confirm');
    expect(confirmDiscardUnsavedChanges()).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('keeps the current tab when the user cancels, and leaves after confirming', () => {
    useUiStore.getState().setActiveTab('settings');
    setUnsavedChanges('有未存檔的變更');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    useUiStore.getState().setActiveTab('checkout');
    expect(useUiStore.getState().activeTab).toBe('settings');
    expect(hasUnsavedChanges()).toBe(true);

    confirm.mockReturnValueOnce(true);
    useUiStore.getState().setActiveTab('checkout');
    expect(useUiStore.getState().activeTab).toBe('checkout');
    expect(hasUnsavedChanges()).toBe(false);
  });

  it('restores the hash when back navigation is cancelled', () => {
    useUiStore.getState().setActiveTab('settings');
    setUnsavedChanges('有未存檔的變更');
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    window.location.hash = '#/inventory';
    useUiStore.getState().syncStateFromHash('inventory', null);
    expect(useUiStore.getState().activeTab).toBe('settings');
    expect(window.location.hash).toBe('#/settings');
  });
});
