# Google 登入與門市工作階段

這份說明對齊後端 PR [freds-pos-be#11](https://github.com/wolfdigit/freds-pos-be/pull/11) 的 `prompts/auth/01-fe-contract.md`。前端沒有用真實 Google 帳號跑過端對端登入；下面的設定完成前，不能把登入當成已經在正式環境驗證過。

Vercel 預覽要用的 Git 分支名稱，前端與後端都是 `oauth`。預覽網址以該分支的 Vercel GitHub check 上的 Preview 連結為準，不要用手猜的 `*.vercel.app` 別名。後端 `oauth` 由後端作業建立；這份前端說明不代替後端推分支。

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
- `FREDS_POS_SESSION` 裡舊的示範身份、角色與瀏覽器裡的示範帳號不再當成登入依據。真實 API 模式的身份只採 `GET /auth/me`。
- 使用者管理呼叫 `GET/POST /api/v1/system/oauth/accounts` 與 `PUT/DELETE /api/v1/system/oauth/accounts/{email}`。只有管理員看得到這個分頁。不能刪自己、不能改自己的角色，最後一位管理員不能刪除或降權；後端仍以 `409` `ACCOUNT_SELF_PROTECTED` 或 `ACCOUNT_LAST_ADMIN` 作準。
- 門市清單管理（新增、刪除）只限管理員，走 `/api/v1/system/stores`。店員仍用 `GET /api/v1/auth/stores` 看門市，並用 `POST /api/v1/auth/store` 選門市或換門市，不必重新跟 Google 驗證。上方的登入門市選單會保留。
- 部署設定 `USE_MOCK: false` 時，畫面上的 Mock 切換無效，也不能靠 `localStorage['USE_MOCK']` 回到示範身份。

錯誤本體是 `{ "code", "message" }`。`401` 的 `AUTH_REQUIRED`、`AUTH_SESSION_EXPIRED`、`AUTH_SESSION_REVOKED`、`AUTH_ACCOUNT_NOT_ALLOWED` 會清掉這個瀏覽器的登入。`403` `AUTH_FORBIDDEN` 與 `AUTH_STORE_REQUIRED` 不清 token。登入當下的 `401` `AUTH_INVALID_CREDENTIAL` 與 `403` `AUTH_ACCOUNT_NOT_ALLOWED` 只代表這次 Google 憑證失敗。

## Google Cloud Console

1. 建立或選一個 Google Cloud 專案。
2. 設定 OAuth 同意畫面。範圍維持預設的 OpenID email，不要加 Gmail API。
3. 建立憑證：OAuth 用戶端 ID，應用程式類型選「網頁應用程式」。
4. 已授權的 JavaScript 來源填「前端 `oauth` 分支」在 Vercel check 上的 Preview 來源（含 `https://`，不含路徑），以及需要時的 `http://localhost:5173`。不要填後端網址，也不要把 client secret 放進前端。每次部署自己的網址如果和分支 Preview 不同，Google 不會把它當成同一個來源。
5. 複製用戶端 ID。它會出現在瀏覽器裡，這是公開值，不是密鑰。

## 前端環境

建置時 `scripts/generate-config.mjs` 會寫進 `public/config.js` 的 `window.__APP_CONFIG__`。

| 變數 | 用途 |
| --- | --- |
| `VITE_USE_MOCK=false` | 正式切換。`true` 仍是本地示範資料，不經 Google。 |
| `VITE_API_BASE_URL` | 後端 `oauth` 分支的 Vercel Preview，加上 `/api/v1`。用該分支 check 上的實際 Preview 網址，不要猜。 |
| `VITE_GOOGLE_CLIENT_ID` | 網頁用戶端 ID。空白時真實 API 模式會停在「Google 登入尚未設定」，不開業務畫面。 |
| `VITE_API_TIMEOUT_MS` | 既有逾時，預設 15000。 |

沒有 `VITE_` 前綴的 `USE_MOCK`、`API_BASE_URL`、`GOOGLE_CLIENT_ID`、`API_TIMEOUT_MS` 也會被讀取。改完要重新執行 `npm run generate:config` 或 `npm run build`。打包後也可以替換 `dist/config.js`，不要把真實用戶端 ID 寫死在原始碼。

## 後端環境

變數名稱以後端 `src/core/config.py` 與 `.env.example` 為準。預覽請只加在 Vercel 專案 `freds-pos-be` 的 Preview，並把 Git 分支限在 `oauth`，不要改 Production。

| 變數 | 用途 |
| --- | --- |
| `SQLALCHEMY_DATABASE_URI` | 資料庫連線。程式預設 `sqlite:///./freds_pos.db`。`postgres://` 與 `postgresql://` 會被改成 `postgresql+psycopg2://`。預覽要用自己的資料庫，不要和正式環境共用同一條連線。 |
| `GOOGLE_CLIENT_ID` | 與前端同一個網頁用戶端 ID。可逗號分隔。沒設定時登入回 `503` `AUTH_NOT_CONFIGURED`。 |
| `AUTH_BOOTSTRAP_ADMIN_EMAIL` | 只在 `oauth_account` 還是空的時建立第一位管理員。不要填 `fred@gmail.com`、`admin@gmail.com`、`clerk01@gmail.com`、`clerk02@gmail.com`、`staff@gmail.com`。 |
| `AUTH_BOOTSTRAP_ADMIN_NAME` | 選填。空白時顯示名稱用 email。 |
| `DEBUG` | 預覽與正式都設 `false`。`true` 時會打開 `/docs` 與 `/api/v1/openapi.json`。 |
| `BACKEND_CORS_ORIGINS` | 額外允許的前端來源，逗號或 JSON 陣列。程式另外用正則允許 `https://*.vercel.app`，所以 Vercel 預覽來源不必逐一加進這份清單。 |
| `APP_ENV` 或 `ENVIRONMENT` | 選填。有值時會再讀 `.env.{APP_ENV}`。 |

倉庫裡沒有在 Vercel 建置時自動執行 `alembic upgrade head` 的設定。migration 要由人對「預覽那條」`SQLALCHEMY_DATABASE_URI` 執行，而且要在開放登入測試之前。這份說明沒有執行 migration，也沒有改任何環境變數。

第一位管理員來自由部署環境提供的信箱，不是前端種子名單。名單裡有資料之後，這個變數不會再補權限。

## 預覽測試順序

1. 後端作業把同一份登入改動推到分支 `oauth`。等該分支的 Vercel check 出現 Preview 連結。
2. 對那條預覽資料庫執行 `alembic upgrade head`。目前登入相關 revision 含 `c8e2a4b71d90`。
3. 在後端 Preview、分支 `oauth` 設定上表的變數。`GOOGLE_CLIENT_ID` 與前端相同。然後讓該分支重新建置，讓新的環境變數進到運行中的程式。
4. 在前端專案 `freds-pos-fe` 的 Preview、分支 `oauth` 設定 `VITE_USE_MOCK=false`、`VITE_API_BASE_URL=<後端 Preview>/api/v1`、`VITE_GOOGLE_CLIENT_ID=<同一個用戶端 ID>`。這些值是在 `npm run build` 的 `generate:config` 寫進 `config.js`，只改 Vercel 變數而不重新建置不會改變已經上線的 `config.js`。
5. 打開前端 `oauth` 的 Preview 後，先看 `/config.js`。要看到 `USE_MOCK: false`、後端 Preview 的 API 位址，以及非空白的 `GOOGLE_CLIENT_ID`。目前舊的前端 PR 預覽仍是 `USE_MOCK: true` 與 `http://localhost:8000/api/v1`，那個網址不是 `oauth` 分支。
6. Google 已授權的 JavaScript 來源填前端 `oauth` Preview 的來源。用已加入使用者管理的 Google 帳號登入，再選門市。
7. 前端已經在畫面上擋住刪除最後一間門市。後端現在也回 `409`，body 是 `{ "code": "LAST_STORE", "message": "至少要保留一間門市" }`。若請求真的打到 API，現有 HTTP client 會顯示後端的 `message`。

跨來源：前端把 `Authorization` 放在 header，不送 cookie。後端 CORS 對 `https://*.vercel.app` 的預檢會回傳該前端來源，並允許 `authorization`。這不代表 Vercel Deployment Protection 已經關掉。若之後預覽被 Vercel 登入頁擋住，瀏覽器從另一個專案呼叫 API 會先碰到保護頁，FastAPI 的 CORS 幫不上忙。探測當下那兩個舊分支預覽沒有被登入頁擋住；這不是端對端登入已成功，也還不是 `oauth` 分支的結果。

## 一起上線

1. 後端先套用該 PR 的 migration：`alembic upgrade head`。
2. 設定後端 `GOOGLE_CLIENT_ID`、`AUTH_BOOTSTRAP_ADMIN_EMAIL`，必要時加上名稱，並讓 `DEBUG=false`。
3. 用那位管理員的 Google 帳號可以登入後，再由管理員在「使用者管理」加入其他人。未加入的 Google 帳號會被拒絕，不會自動註冊。
4. 前端以 `VITE_USE_MOCK=false`、正確的 `VITE_API_BASE_URL` 與 `VITE_GOOGLE_CLIENT_ID` 建置，和後端同一批上線。之後未登入的業務 API 會是 `401`。
5. 既有瀏覽器只會失去舊的 `FREDS_POS_CART`。主題、`AUTH_TOKEN`、示範資料鍵與新的 `FREDS_POS_CART:<id>` 都保留。舊的 `FREDS_POS_SESSION` 示範身份不會再被信任。
6. 若系統裡還沒有任何門市，已登入的管理員可以在選門市畫面建立第一間。店員不行。已有門市時，要先選一間已存在的門市；自由輸入一個後端沒有的名稱不會被接受。

還沒有把 Google 用戶端 ID 配進這個環境，所以這次沒有完成真實 Google 登入的端對端驗證。
