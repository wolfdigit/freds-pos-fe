import { useState } from 'react';
import { useCustomerSearch } from './hooks/useCustomerSearch';
import { CustomerListPanel } from './components/CustomerListPanel';
import { CustomerDetailPanel } from './components/CustomerDetailPanel';
import { CustomerModal } from './components/CustomerModal';
import type { Customer } from '@/types/customer';

export function CustomersPage() {
  const { keyword, setKeyword, customers, selectedId, setSelectedId, reload } = useCustomerSearch();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  const handleOpenAdd = () => {
    setModalCustomer(null);
    setModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (selected) {
      setModalCustomer(selected);
      setModalOpen(true);
    }
  };

  const handleSaved = (saved: Customer) => {
    reload(saved.id);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <CustomerListPanel
        keyword={keyword}
        onKeywordChange={setKeyword}
        customers={customers}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAddClick={handleOpenAdd}
      />

      {selected ? (
        <CustomerDetailPanel customer={selected} onEditClick={handleOpenEdit} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-zinc-500 select-none">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-base font-medium">請從左側列表選擇一位會員或點選「新增會員」</p>
        </div>
      )}

      <CustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={modalCustomer}
        onSaved={handleSaved}
      />
    </div>
  );
}
