const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let loading: Promise<void> | null = null;

export function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error('無法載入 Google 登入元件。請檢查網路，或確認瀏覽器沒有擋下 accounts.google.com。'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export function renderGoogleButton(
  parent: HTMLElement,
  clientId: string,
  onCredential: (credential: string) => void
): void {
  const googleId = window.google?.accounts?.id;
  if (!googleId) {
    throw new Error('Google 登入元件尚未就緒');
  }
  googleId.initialize({
    client_id: clientId,
    callback: (response) => {
      const credential = response.credential;
      if (!credential) return;
      onCredential(credential);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  googleId.renderButton(parent, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    width: 320,
  });
}
