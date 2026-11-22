import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ISystemService } from '@/services/interfaces/ISystemService';
import type { StoreDto, StoreProductBatchRequest, StoreProductItem, StoreProductQuery } from '@/types/system';
import { hasUnsavedChanges, setUnsavedChanges } from '@/utils/unsavedChanges';
import { StoreProductListPanel } from './StoreProductListPanel';

function store(name: string, productScope: 'all' | 'list'): StoreDto {
  return {
    name,
    productScope,
    inventoryLocationId: 'loc',
    inventoryLocationName: '門市現貨',
    returnedInventoryLocationId: 'ret',
    returnedInventoryLocationName: '退貨品',
    preorderInventoryLocationId: 'pre',
    preorderInventoryLocationName: '預購保留',
  };
}

function row(sku: string, inList: boolean): StoreProductItem {
  return { productId: `prod-${sku}`, sku, barcode: sku, brand: 'B', name: `QA-${sku}`, listPrice: 100, inList };
}

function serviceFor(options: { failSave?: boolean } = {}) {
  const queries: StoreProductQuery[] = [];
  const listed = new Set(['prod-A']);
  const saves: StoreProductBatchRequest[] = [];
  const service = {
    getStores: vi.fn(),
    createStore: vi.fn(),
    rebindStore: vi.fn(),
    deleteStore: vi.fn(),
    listAccounts: vi.fn(),
    createAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
    listStoreChoices: vi.fn(async () => [store('奇可門市', 'all'), store('台南快閃店', 'list')]),
    setStoreProductScope: vi.fn(async (name: string, scope: 'all' | 'list') => store(name, scope)),
    listStoreProducts: vi.fn(async (storeName: string, query: StoreProductQuery) => {
      queries.push(query);
      const all = ['A', 'B', 'C'].map((sku) => row(sku, listed.has(`prod-${sku}`)));
      const keyword = (query.keyword ?? '').toUpperCase();
      const items = all
        .filter((item) => !keyword || item.sku.includes(keyword))
        .filter((item) => query.inList === undefined || item.inList === query.inList);
      const start = (query.page - 1) * query.pageSize;
      return {
        storeName,
        productScope: storeName === '台南快閃店' ? ('list' as const) : ('all' as const),
        listedTotal: listed.size,
        items: items.slice(start, start + query.pageSize),
        page: query.page,
        pageSize: query.pageSize,
        total: items.length,
      };
    }),
    saveStoreProducts: vi.fn(async (storeName: string, request: StoreProductBatchRequest) => {
      saves.push(request);
      if (options.failSave) throw new Error('網路錯誤');
      request.add.forEach((id) => listed.add(id));
      request.remove.forEach((id) => listed.delete(id));
      return {
        storeName,
        productScope: 'list' as const,
        changed: request.add.length + request.remove.length,
        added: request.add.length,
        removed: request.remove.length,
        listedTotal: listed.size,
      };
    }),
    copyStoreProducts: vi.fn(async (storeName: string) => ({
      storeName,
      productScope: 'list' as const,
      changed: 2,
      listedTotal: 3,
    })),
  };
  return { service: service as unknown as ISystemService, mocks: service, queries, saves };
}

afterEach(() => setUnsavedChanges(null));

describe('StoreProductListPanel', () => {
  it('stages ticks across search, filter and paging, then saves once', async () => {
    const user = userEvent.setup();
    const { service, mocks, queries, saves } = serviceFor();
    render(<StoreProductListPanel currentStoreName="台南快閃店" service={service} pageSize={2} />);

    await waitFor(() => expect(screen.getByText('QA-A')).toBeInTheDocument());
    expect(screen.getByTestId('store-product-scope')).toHaveTextContent('只販售清單商品');
    // 一般店員也看得到切換販售範圍。
    expect(screen.getByRole('button', { name: '改為販售全部商品' })).toBeInTheDocument();
    const save = screen.getByRole('button', { name: '存檔' });
    expect(save).toBeDisabled();

    await user.click(screen.getByLabelText('B 加入清單'));
    await user.click(screen.getByLabelText('A 移出清單'));
    expect(mocks.saveStoreProducts).not.toHaveBeenCalled();
    expect(screen.getByTestId('store-product-save-bar')).toHaveTextContent('未存檔變更 2 項');
    expect(save).toBeEnabled();
    expect(hasUnsavedChanges()).toBe(true);

    // 換頁：C 在第 2 頁。勾選後回第 1 頁，之前的勾選還在。
    await user.click(screen.getByRole('button', { name: '下一頁' }));
    await waitFor(() => expect(screen.getByText('QA-C')).toBeInTheDocument());
    await user.click(screen.getByLabelText('C 加入清單'));
    await user.click(screen.getByRole('button', { name: '上一頁' }));
    await waitFor(() => expect(screen.getByLabelText('B 移出清單')).toBeChecked());
    expect(screen.getByLabelText('A 加入清單')).not.toBeChecked();

    // 搜尋、篩選後勾選仍保留，且交給後端分頁。
    await user.type(screen.getByLabelText('搜尋商品'), 'b');
    await waitFor(() => expect(queries.some((query) => query.keyword === 'b')).toBe(true));
    await waitFor(() => expect(screen.getByLabelText('B 移出清單')).toBeChecked());
    await user.clear(screen.getByLabelText('搜尋商品'));
    await user.selectOptions(screen.getByLabelText('清單篩選'), 'in');
    await waitFor(() => expect(queries.at(-1)).toMatchObject({ inList: true, page: 1 }));
    expect(screen.getByTestId('store-product-save-bar')).toHaveTextContent('未存檔變更 3 項');

    // 勾回原狀就不算變更。
    await user.selectOptions(screen.getByLabelText('清單篩選'), 'all');
    await waitFor(() => expect(screen.getByLabelText('A 加入清單')).toBeInTheDocument());
    await user.click(screen.getByLabelText('A 加入清單'));
    expect(screen.getByTestId('store-product-save-bar')).toHaveTextContent('未存檔變更 2 項');

    await user.click(save);
    await waitFor(() => expect(mocks.saveStoreProducts).toHaveBeenCalledTimes(1));
    expect(saves[0].add.sort()).toEqual(['prod-B', 'prod-C']);
    expect(saves[0].remove).toEqual([]);
    await waitFor(() => expect(screen.getByTestId('store-product-save-bar')).toHaveTextContent('沒有未存檔的變更'));
    expect(hasUnsavedChanges()).toBe(false);
    expect(screen.getByRole('button', { name: '存檔' })).toBeDisabled();
  });

  it('keeps the ticks when saving fails', async () => {
    const user = userEvent.setup();
    const { service } = serviceFor({ failSave: true });
    render(<StoreProductListPanel currentStoreName="台南快閃店" service={service} />);
    await waitFor(() => expect(screen.getByText('QA-B')).toBeInTheDocument());
    await user.click(screen.getByLabelText('B 加入清單'));
    await user.click(screen.getByRole('button', { name: '存檔' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('網路錯誤');
    expect(screen.getByLabelText('B 移出清單')).toBeChecked();
    expect(screen.getByTestId('store-product-save-bar')).toHaveTextContent('未存檔變更 1 項');
  });

  it('asks before switching store with unsaved ticks', async () => {
    const user = userEvent.setup();
    const { service, mocks } = serviceFor();
    render(<StoreProductListPanel currentStoreName="台南快閃店" service={service} />);
    await waitFor(() => expect(screen.getByText('QA-B')).toBeInTheDocument());
    await user.click(screen.getByLabelText('B 加入清單'));
    // 有未存檔的勾選時不能複製。
    expect(screen.getByRole('button', { name: '複製' })).toBeDisabled();

    await user.selectOptions(screen.getByLabelText('選擇門市'), '奇可門市');
    let dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: '留在這裡' }));
    expect(screen.getByLabelText('選擇門市')).toHaveValue('台南快閃店');
    expect(screen.getByLabelText('B 移出清單')).toBeChecked();

    await user.selectOptions(screen.getByLabelText('選擇門市'), '奇可門市');
    dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: '放棄變更並切換' }));
    await waitFor(() => expect(screen.getByLabelText('選擇門市')).toHaveValue('奇可門市'));
    await waitFor(() =>
      expect(mocks.listStoreProducts).toHaveBeenLastCalledWith('奇可門市', expect.objectContaining({ page: 1 }))
    );
    expect(screen.getByTestId('store-product-save-bar')).toHaveTextContent('沒有未存檔的變更');
    expect(mocks.saveStoreProducts).not.toHaveBeenCalled();
  });

  it('copies another store list after confirming', async () => {
    const user = userEvent.setup();
    const { service, mocks } = serviceFor();
    render(<StoreProductListPanel currentStoreName="台南快閃店" service={service} />);
    await waitFor(() => expect(screen.getByText('QA-A')).toBeInTheDocument());

    await user.selectOptions(screen.getByLabelText('複製來源門市'), '奇可門市');
    await user.click(screen.getByLabelText(/取代/));
    await user.click(screen.getByRole('button', { name: '複製' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: '確定複製' }));
    await waitFor(() =>
      expect(mocks.copyStoreProducts).toHaveBeenCalledWith('台南快閃店', { sourceStoreName: '奇可門市', replace: true })
    );
  });

  it('any user switches the store scope', async () => {
    const user = userEvent.setup();
    const { service, mocks } = serviceFor();
    render(<StoreProductListPanel currentStoreName="奇可門市" service={service} />);
    await waitFor(() => expect(screen.getByTestId('store-product-scope')).toHaveTextContent('販售全部商品'));
    await user.click(screen.getByRole('button', { name: '改為只販售清單商品' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: '確定切換' }));
    await waitFor(() => expect(mocks.setStoreProductScope).toHaveBeenCalledWith('奇可門市', 'list'));
    await waitFor(() => expect(screen.getByTestId('store-product-scope')).toHaveTextContent('只販售清單商品'));
  });
});
