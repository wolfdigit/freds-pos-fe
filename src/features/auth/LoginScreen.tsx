import { useEffect, useRef, useState } from 'react';
import { loadGoogleIdentityScript, renderGoogleButton } from '@/auth/googleIdentity';
import { errorMessage } from '@/auth/businessError';
import { readGoogleClientId } from '@/auth/runtimeConfig';
import { Spinner } from '@/components/feedback/Spinner';
import { useAuthStore } from '@/store/authStore';

export function LoginScreen() {
  const loginWithCredential = useAuthStore((state) => state.loginWithCredential);
  const buttonHost = useRef<HTMLDivElement>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const clientId = readGoogleClientId();
    let cancelled = false;
    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !buttonHost.current) return;
        buttonHost.current.replaceChildren();
        renderGoogleButton(buttonHost.current, clientId, (credential) => {
          setLoginError(null);
          setSubmitting(true);
          void loginWithCredential(credential)
            .catch((err: unknown) => {
              setLoginError(errorMessage(err, 'Google 登入失敗'));
            })
            .finally(() => {
              if (!cancelled) setSubmitting(false);
            });
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) setScriptError(errorMessage(err, '無法載入 Google 登入元件'));
      });
    return () => {
      cancelled = true;
    };
  }, [loginWithCredential]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl">
        <p className="text-sm font-semibold tracking-wide text-cyan-300">FRED'S POS</p>
        <h1 className="mt-2 text-2xl font-bold">使用 Google 帳號登入</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          只使用 Google 已驗證的 email 比對後端白名單。不會要求 Gmail 權限，也不會在這裡建立新帳號。
        </p>
        <div className="mt-6 min-h-11" ref={buttonHost} />
        {submitting && (
          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
            <Spinner size="sm" />
            <span>正在向門市系統確認帳號…</span>
          </div>
        )}
        {scriptError && <p className="mt-4 text-sm text-rose-300">{scriptError}</p>}
        {loginError && (
          <p className="mt-4 text-sm text-rose-300" role="alert">
            {loginError}
          </p>
        )}
      </section>
    </div>
  );
}
