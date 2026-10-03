/**
 * Runtime 運行期設定檔
 * 
 * 說明：
 * 此檔案在 Build 階段由 scripts/generate-config.mjs 依據環境變數動態產生。
 * 在打包後，亦可直接修改 dist/config.js 或由 Docker 動態替換。
 */
window.__APP_CONFIG__ = {
  // 是否啟用假資料（Mock Service）：true 為 Mock，false 為真實 HTTP API
  USE_MOCK: true,

  // 後端真實 API Base URL（當 USE_MOCK 為 false 時使用）
  API_BASE_URL: 'http://localhost:8000/api/v1',

  // API 請求逾時時間（毫秒）
  API_TIMEOUT_MS: 15000,
};
