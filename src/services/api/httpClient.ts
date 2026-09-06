import { useToastStore } from '@/components/feedback/toastStore';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  /** 是否靜音特定錯誤（例如單一查詢 404 時不彈出 Toast，但仍印 console） */
  silentToast?: boolean;
}

export class ApiError extends Error {
  constructor(
    public override message: string,
    public status: number,
    public statusText: string,
    public url: string,
    public responseBody?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class HttpClient {
  private get baseUrl(): string {
    return window.__APP_CONFIG__?.API_BASE_URL?.replace(/\/+$/, '') || '';
  }

  private get defaultTimeoutMs(): number {
    return window.__APP_CONFIG__?.API_TIMEOUT_MS || 15000;
  }

  private notifyError(toastMsg: string, consoleTitle: string, details: Record<string, unknown>) {
    // 1. 印出詳細訊息到 Console
    console.error(`❌ [${consoleTitle}]`, details);

    // 2. 在畫面上透過 Toast 顯示錯誤訊息
    try {
      useToastStore.getState().showToast(toastMsg, 'error');
    } catch {
      // 避免在非 React 環境崩潰
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = localStorage.getItem('AUTH_TOKEN');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    // 結合傳入的 signal 與超時 controller
    const signal = options.signal || controller.signal;

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      const isAbort = (err as Error)?.name === 'AbortError' || controller.signal.aborted;
      if (isAbort) {
        const errorMsg = `API 請求逾時（超過 ${Math.round(timeoutMs / 1000)} 秒）：${endpoint}`;
        if (!options.silentToast) {
          this.notifyError(errorMsg, 'HttpClient Request Timeout', {
            url,
            method,
            timeoutMs,
            error: err,
          });
        }
        throw new ApiError(errorMsg, 408, 'Request Timeout', url);
      }

      // 伺服器無法連線 / 網路斷線 / CORS 阻擋 / DNS 失敗
      const errorMsg = `無法連線至 API 伺服器：${endpoint}`;
      if (!options.silentToast) {
        this.notifyError(
          `${errorMsg} (請確認後端 ${this.baseUrl || '伺服器'} 是否已啟動)`,
          'HttpClient Network/Connection Error',
          {
            url,
            method,
            baseUrl: this.baseUrl,
            error: err,
          }
        );
      }
      throw new ApiError(errorMsg, 0, 'Network Error', url, err);
    } finally {
      clearTimeout(timeoutId);
    }

    // 處理 HTTP 回應錯誤（4xx / 5xx）
    if (!response.ok) {
      let responseBody: unknown;
      let errorText = '';
      try {
        const text = await response.text();
        errorText = text;
        responseBody = text ? JSON.parse(text) : null;
      } catch {
        responseBody = errorText;
      }

      const status = response.status;
      let userFriendlyMsg = '';

      const bodyMessage =
        typeof responseBody === 'object' && responseBody !== null
          ? (responseBody as any).message ||
            (typeof (responseBody as any).detail === 'string'
              ? (responseBody as any).detail
              : (responseBody as any).detail?.message)
          : undefined;

      if (bodyMessage && typeof bodyMessage === 'string') {
        userFriendlyMsg = bodyMessage;
      } else if (status === 404) {
        userFriendlyMsg = `API 端點不存在 (404)：${endpoint}`;
      } else if (status === 401 || status === 403) {
        userFriendlyMsg = `權限不足或未授權 (${status})：${endpoint}`;
      } else if (status >= 500) {
        userFriendlyMsg = `伺服器內部錯誤 (${status})：${endpoint}`;
      } else {
        userFriendlyMsg = `API 請求失敗 (${status})：${endpoint}`;
      }

      if (!options.silentToast) {
        this.notifyError(userFriendlyMsg, `HttpClient HTTP ${status} Error`, {
          url,
          method,
          status,
          statusText: response.statusText,
          responseBody,
        });
      }

      throw new ApiError(
        userFriendlyMsg,
        status,
        response.statusText,
        url,
        responseBody
      );
    }

    // HTTP 200~299 成功狀態（包括 204 No Content，或資料為空）
    if (response.status === 204) {
      return null as T;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const text = await response.text();
      if (!text || text.trim() === '') {
        return null as T;
      }
      return JSON.parse(text) as T;
    }

    return (await response.text()) as unknown as T;
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
