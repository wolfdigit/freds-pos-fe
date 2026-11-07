# Google 登入與門市工作階段

這份說明對齊後端 PR [freds-pos-be#11](https://github.com/wolfdigit/freds-pos-be/pull/11) 分支 `cursor/google-account-signin-9344` 的 `prompts/auth/01-fe-contract.md`。前端沒有用真實 Google 帳號跑過端對端登入；下面的設定完成前，不能把登入當成已經在正式環境驗證過。

## 行為

- 真實 API 模式（`USE_MOCK: false`）必須先用 Google Identity Services 取得 ID token，再 `POST /api/v1/auth/google`，body 只有 `{ "credential" }`。
- 不要求 Gmail 權限，前端不放 client secret。
- 後端回傳的 `token` 寫入 `localStorage['AUTH_TOKEN']`。之後的請求帶 `Authorization: Bearer <token>`，不使用 cookie。
- Session 由伺服器固定 12 小時，前端不延長。登出只廢除目前這把 token。
- 同一個瀏覽器的分頁共用這把 token。某一頁登出、換人，或收到會結束工作階段的 `401` 時，其他分頁一起關掉登入狀態。其他裝置不受影響。
- 登入後必須 `POST /api/v1/auth/store` 選一間已存在的門市。還沒選門市時，業務 API 會回 `403` `AUTH_STORE_REQUIRED`；`/auth/*` 仍可使用。
- 登入門市只寫進訂單。庫存仍扣同一個「門市現貨」，換門市不建立每間門市的庫存，也不清購物車。購物車有商品時只顯示提示。
- 購物車鍵是 `FREDS_POS_CART:<whitelist user.id>`。登出、過期、關分頁都留著。未確認身份前不讀、不改購物車。
- 升級時只刪除舊的未歸屬鍵 `FREDS_POS_CART`。不刪其他 localStorage，也不刪已經按帳號分開的購物車。
- `FREDS_POS_SESSION` 裡舊的示範身份、角色與前端白名單不再當成登入依據。真實 API 模式的身份只採 `GET /auth/me`。
- 白名單畫面呼叫 `GET/POST /api/v1/system/oauth/accounts` 與 `PUT/DELETE /api/v1/system/oauth/accounts/{email}`。只有管理員看得到這個分頁。不能刪自己、不能改自己的角色，最後一位管理員不能刪除或降權；後端仍以 `409` `ACCOUNT_SELF_PROTECTED` 或 `ACCOUNT_LAST_ADMIN` 作準。
- 部署設定 `USE_MOCK: false` 時，畫面上的 Mock 切換無效，也不能靠 `localStorage['USE_MOCK']` 回到示範身份。

錯誤本體是 `{ "code", "message" }`。`401` 的 `AUTH_REQUIRED`、`AUTH_SESSION_EXPIRED`、`AUTH_SESSION_REVOKED`、`AUTH_ACCOUNT_NOT_ALLOWED` 會清掉這個瀏覽器的登入。`403` `AUTH_FORBIDDEN` 與 `AUTH_STORE_REQUIRED` 不清 token。登入當下的 `401` `AUTH_INVALID_CREDENTIAL` 與 `403` `AUTH_ACCOUNT_NOT_ALLOWED` 只代表這次 Google 憑證失敗。

## Google Cloud Console

1. 建立或選一個 Google Cloud 專案。
2. 設定 OAuth 同意畫面。範圍維持預設的 OpenID email，不要加 Gmail API。
3. 建立憑證：OAuth 用戶端 ID，應用程式類型選「網頁應用程式」。
4. 已授權的 JavaScript 來源填前端網址，例如本地 `http://localhost:5173` 與正式的 Vercel 來源。不要把 client secret 放進這個前端。
5. 複製用戶端 ID。它會出現在瀏覽器裡，這是公開值，不是密鑰。

## 前端環境

建置時 `scripts/generate-config.mjs` 會寫進 `public/config.js` 的 `window.__APP_CONFIG__`。

| 變數 | 用途 |
| --- | --- |
| `VITE_USE_MOCK=false` | 正式切換。`true` 仍是本地示範資料，不經 Google。 |
| `VITE_API_BASE_URL` | 例如 `https://<backend>.vercel.app/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | 網頁用戶端 ID。空白時真實 API 模式會停在「Google 登入尚未設定」，不開業務畫面。 |
| `VITE_API_TIMEOUT_MS` | 既有逾時，預設 15000。 |

沒有 `VITE_` 前綴的 `USE_MOCK`、`API_BASE_URL`、`GOOGLE_CLIENT_ID`、`API_TIMEOUT_MS` 也會被讀取。改完要重新執行 `npm run generate:config` 或 `npm run build`。打包後也可以替換 `dist/config.js`，不要把真實用戶端 ID 寫死在原始碼。

## 後端環境

以前端不修改的後端 PR 為準：

| 變數 | 用途 |
| --- | --- |
| `GOOGLE_CLIENT_ID` | 與前端同一個用戶端 ID。可以是逗號分隔的多個 ID。沒設定時登入回 `503` `AUTH_NOT_CONFIGURED`。 |
| `AUTH_BOOTSTRAP_ADMIN_EMAIL` | 只在 `oauth_account` 還是空的時建立第一位管理員。不要填前端示範信箱。 |
| `AUTH_BOOTSTRAP_ADMIN_NAME` | 選填。第一位管理員的顯示名稱。 |
| `DEBUG=false` | 正式環境。 |

第一位管理員來自由部署環境提供的信箱，不是前端種子名單。名單裡有資料之後，這個變數不會再補權限。

## 一起上線

1. 後端先套用該 PR 的 migration：`alembic upgrade head`。
2. 設定後端 `GOOGLE_CLIENT_ID`、`AUTH_BOOTSTRAP_ADMIN_EMAIL`，必要時加上名稱，並讓 `DEBUG=false`。
3. 用那位管理員的 Google 帳號可以登入後，再由管理員在「帳號白名單」加入其他人。未在名單內的 Google 帳號會被拒絕，不會自動註冊。
4. 前端以 `VITE_USE_MOCK=false`、正確的 `VITE_API_BASE_URL` 與 `VITE_GOOGLE_CLIENT_ID` 建置，和後端同一批上線。之後未登入的業務 API 會是 `401`。
5. 既有瀏覽器只會失去舊的 `FREDS_POS_CART`。主題、`AUTH_TOKEN`、示範資料鍵與新的 `FREDS_POS_CART:<id>` 都保留。舊的 `FREDS_POS_SESSION` 示範身份不會再被信任。
6. 若系統裡還沒有任何門市，已登入的管理員可以在選門市畫面建立第一間。店員不行。已有門市時，要先選一間已存在的門市；自由輸入一個後端沒有的名稱不會被接受。

還沒有把 Google 用戶端 ID 配進這個環境，所以這次沒有完成真實 Google 登入的端對端驗證。
