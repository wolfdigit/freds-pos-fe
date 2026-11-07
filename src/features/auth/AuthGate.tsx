import { useEffect, type ReactNode } from 'react';
import { isMockService } from '@/services';
import { startAuthRuntime, useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/feedback/Spinner';
import { LoginScreen } from './LoginScreen';
import { StoreSelectScreen } from './StoreSelectScreen';

export function AuthGate({ children }: { children: ReactNode }) {
  const phase = useAuthStore((state) => state.phase);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const restore = useAuthStore((state) => state.restore);
  const retry = useAuthStore((state) => state.retry);

  useEffect(() => {
    const stop = startAuthRuntime();
    void restore();
    return stop;
  }, [restore]);

  if (isMockService || phase === 'mock' || phase === 'ready') {
    return children;
  }

  if (phase === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-950 text-zinc-200">
        <Spinner size="lg" />
        <p>正在確認登入狀態</p>
      </div>
    );
  }

  if (phase === 'unconfigured') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
        <section className="max-w-lg rounded-2xl border border-amber-800/60 bg-zinc-900 p-8">
          <h1 className="text-2xl font-bold">Google 登入尚未設定</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{errorMessage}</p>
        </section>
      </div>
    );
  }

  if (phase === 'unreachable') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
        <section className="max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <h1 className="text-2xl font-bold">無法確認登入</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{errorMessage}</p>
          <Button className="mt-6" variant="primary" onClick={() => void retry()}>
            再試一次
          </Button>
        </section>
      </div>
    );
  }

  if (phase === 'needs-store') return <StoreSelectScreen />;
  return <LoginScreen />;
}
