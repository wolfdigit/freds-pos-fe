/**
 * Runtime 運行期設定檔
 * 
 * 說明：
 * 此檔案在 Vite build 時會原封不動複製到 dist/ 目錄下。
 * 在打包（transpile）後，您可以直接透過文字編輯器修改 dist/config.js，
 * 或在 Docker / 伺服器部署時動態替換此檔案，無須重新 build。
 */
window.__APP_CONFIG__ = {
  // 是否啟用假資料（Mock Service）：true 為 Mock，false 為真實 HTTP API
  USE_MOCK: true,

  // 後端真實 API Base URL（當 USE_MOCK 為 false 時使用）
  API_BASE_URL: 'http://localhost:8000/api/v1',

  // API 請求逾時時間（毫秒）
  API_TIMEOUT_MS: 15000,
};
