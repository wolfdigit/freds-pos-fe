import fs from 'fs';
import path from 'path';

// 嘗試載入本機 .env 或 .env.local（若存在）
for (const envFile of ['.env', '.env.local', '.env.production']) {
  if (fs.existsSync(envFile)) {
    try {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envFile);
      }
    } catch {
      // 忽略解析錯誤
    }
  }
}

/**
 * 將環境變數轉換為布林值
 * 支援: 'false', '0', 'no', 'off', 'f' (不分大小寫、去頭尾空白)
 * @param {string | undefined} val 
 * @param {boolean} defaultValue 當未設定或空值時的預設值
 */
export function parseBoolean(val, defaultValue = true) {
  if (val === undefined || val === null || String(val).trim() === '') {
    return defaultValue;
  }
  const normalized = String(val).trim().toLowerCase();
  if (['false', '0', 'no', 'off', 'f'].includes(normalized)) {
    return false;
  }
  if (['true', '1', 'yes', 'on', 't'].includes(normalized)) {
    return true;
  }
  return defaultValue;
}

// 優先讀取 VITE_ 前綴，若無則 fallback 到無前綴版本
const rawUseMock = process.env.VITE_USE_MOCK ?? process.env.USE_MOCK;
const isUseMock = parseBoolean(rawUseMock, true);

const apiBaseUrl = (
  process.env.VITE_API_BASE_URL ??
  process.env.API_BASE_URL ??
  'http://localhost:8000/api/v1'
).trim();

const apiTimeoutMs = Number(
  process.env.VITE_API_TIMEOUT_MS ??
  process.env.API_TIMEOUT_MS ??
  15000
) || 15000;

const content = `/**
 * Runtime 運行期設定檔
 * 
 * 說明：
 * 此檔案在 Build 階段由 scripts/generate-config.mjs 依據環境變數動態產生。
 * 在打包後，亦可直接修改 dist/config.js 或由 Docker 動態替換。
 */
window.__APP_CONFIG__ = {
  // 是否啟用假資料（Mock Service）：true 為 Mock，false 為真實 HTTP API
  USE_MOCK: ${isUseMock},

  // 後端真實 API Base URL（當 USE_MOCK 為 false 時使用）
  API_BASE_URL: '${apiBaseUrl}',

  // API 請求逾時時間（毫秒）
  API_TIMEOUT_MS: ${apiTimeoutMs},
};
`;

const targetPath = path.resolve('public/config.js');
fs.writeFileSync(targetPath, content, 'utf-8');
console.log(`✅ [Config Generated] USE_MOCK=${isUseMock}, API_BASE_URL="${apiBaseUrl}", API_TIMEOUT_MS=${apiTimeoutMs}`);
