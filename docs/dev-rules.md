# 淡水農友助手 — 開發規範

> 本文檔說明本專案的程式風格、命名慣例、新增功能的開發流程。  
> 每次開啟新對話時請引用此文件，確保程式碼一致性。

---

## 一、專案架構原則

### 1.1 純靜態單頁應用

- 本專案為**單一 `index.html`**，所有 HTML、CSS（Tailwind CDN）、JavaScript 都寫在同一檔案內
- 沒有 `package.json`，沒有 Node.js 建構步驟，沒有 npm 相依
- 所有外部資源（Tailwind CSS、Supabase SDK）透過 CDN 載入

### 1.2 前端架構分層（index.html 內）

```
HTML（Tailwind 語義化結構）
  └── <script> 區塊
        ├── 工具函數（$、pick、escapeHtml、normalizeCrop）
        ├── 資料獲取函數（fetch 開頭）
        ├── 渲染函數（render 開頭）
        ├── UI 初始化函數（init 開頭）
        └── DOMContentLoaded 事件（初始化流程）
```

### 1.3 程式碼載入順序

```html
<head>
  1. Tailwind CSS CDN + 自訂 config（色系 soil/leaf/sky/sun）
  2. Supabase JS SDK CDN
  3. supabaseClient.js（初始化 globalThis.supabaseClient）
</head>
<body>
  4. HTML 結構（各區塊 DOM）
  5. <script> 所有函數定義
  6. <script> DOMContentLoaded 初始化
  7. <script> Service Worker 註冊
</body>
```

---

## 二、命名規範

### 2.1 函數命名

| 前綴 | 用途 | 範例 |
|------|------|------|
| `fetch` | 從 Supabase 或外部 API 讀取資料，回傳 Promise | `fetchCrops()`、`fetchTamsuiWeather()`、`fetchMarketPrices()` |
| `render` | 接收資料，將 HTML 寫入 DOM | `renderMonthlyRecommendations(rows, prices, weather)`、`renderMarketPrices(data)` |
| `init` | 初始化事件監聽與 UI 狀態 | `initAuth()`、`initDiagnosisUI()` |
| `generate` | 純資料運算，回傳計算結果 | `generateDynamicTip(name, month, temp, pop)`、`generateHarvestSuggestions(records, prices, temp, pop)` |
| `refresh` | 重新獲取並更新特定 UI 區塊 | `refreshCommunity()`、`refreshMarketByRecommendations(crops, prices)` |
| `load` | 載入選項或初始資料 | `loadCropOptions()` |
| `add` | 新增記錄 | `addPlantingRecord()` |
| `submit` | 提交表單 | `submitNewPost()`、`submitReply(parentId, content)` |

**內部輔助函數**（由上述函數呼叫，不直接於 DOMContentLoaded 中呼叫）：

| 前綴 | 用途 | 範例 |
|------|------|------|
| `fetchCommunityPosts` | 從 Supabase 獲取主文 + 回覆 | 由 `refreshCommunity()` 呼叫 |
| `renderCommunityPosts` | 渲染社群貼文，含動態綁定回覆按鈕事件 | 由 `refreshCommunity()` 呼叫 |
| `findMarketPrice` | 三層模糊比對作物名稱查找市場均價（精確→雙向包含→關鍵字映射） | 由 `renderMonthlyRecommendations()` 呼叫 |
| `renderMarketTable` | 渲染桌機版市場行情表格 | 由 `renderMarketPrices()` 呼叫 |
| `renderMarketMobile` | 渲染手機版市場行情卡片 | 由 `renderMarketPrices()` 呼叫 |
| `fetchTamsuiWeeklyWeather` | 從 Open-Meteo daily API 抓取七天預報 | 由 `DOMContentLoaded` 呼叫 |
| `renderWeeklyWeather` | 渲染七天預報卡片（當天綠色高亮） | 由 `DOMContentLoaded` 呼叫 |

### 2.2 變數命名

| 慣例 | 說明 | 範例 |
|------|------|------|
| camelCase | 所有 JS 變數與函數 | `weatherData`、`allCropsCache`、`isRegisterMode` |
| 後綴 `Cache` | 前端快取變數（DOMContentLoaded 內） | `marketPricesCache`、`plantingRecordsCache` |
| 後綴 `Map` | Map 型別變數 | `priceMap`、`replyMap` |
| 後綴 `Html` | 預先組好的 HTML 字串 | `priceHtml`、`tipHtml`、`monthsHtml` |
| 後綴 `El` | DOM 元素參考 | `wxEl`、`tEl`、`popEl`、`alertEl` |
| 後綴 `Num` | 明確轉為數值的變數 | `tempNum`、`popNum` |
| 全域變數 | 使用 `let`（非 `const`）置於函數定義之後 | `let weatherData = { temp: null, pop: null }` |
| `globalThis.supabaseClient` | Supabase 客戶端實例 | 全專案共用 |

### 2.3 HTML ID 命名

| 慣例 | 說明 | 範例 |
|------|------|------|
| camelCase | 所有 DOM ID | `monthlyRecommendations`、`marketTableContent` |
| 功能性命名 | 直接反映用途 | `weatherTemp`、`weatherPop`、`weatherWx` |

### 2.4 Supabase 資料表欄位

| 慣例 | 說明 | 範例 |
|------|------|------|
| snake_case | 所有欄位名 | `crop_name`、`planted_date`、`price_avg`、`user_id`、`created_at` |

---

## 三、Tailwind CSS 使用規範

### 3.1 自訂色系

```javascript
// tailwind.config.extend.colors
soil: { 50~900 }   // 土壤色 → 背景、卡片
leaf: { 50~900 }   // 植物綠 → 主色、按鈕、標記（theme_color: #0e8555 = leaf-600）
sky:  { 50~900 }   // 天空藍 → 連結、資訊
sun:  { 50~900 }   // 陽光橙 → 警示、高亮
```

**字型配置**（`fontFamily.sans` 陣列順序，與 `index.html` 中 tailwind.config 一致）：
```
"ui-sans-serif" → "system-ui" → "-apple-system" → "Segoe UI" → "Roboto"
  → "Noto Sans TC"（繁體中文主力字型） → "Helvetica" → "Arial"
  → "Apple Color Emoji" → "Segoe UI Emoji"
```

### 3.2 元件模式

```html
<!-- 卡片基礎 -->
<div class="rounded-2xl bg-white/80 p-6 shadow-soft ring-1 ring-slate-900/5 backdrop-blur">
  ...
</div>

<!-- 內部卡片 -->
<div class="rounded-xl bg-soil-50 p-4 ring-1 ring-slate-900/5">
  ...
</div>

<!-- 主按鈕 -->
<button class="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-leaf-700">
  按鈕文字
</button>

<!-- 次按鈕 -->
<button class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50">
  按鈕文字
</button>

<!-- 徽章（badge） -->
<span class="rounded-full bg-leaf-50 px-3 py-1 text-xs font-semibold text-leaf-800 ring-1 ring-leaf-900/10">標籤</span>
```

### 3.3 回應式設計

- 使用 Tailwind 內建斷點：`sm:`（640px）、`md:`（768px）、`lg:`（1024px）
- 市場行情與種植曆：桌機用 `<table>`（`hidden md:block`），手機用卡片（`md:hidden`）
- 本月推薦：`grid-cols-1 sm:grid-cols-2`

### 3.4 自訂值

```javascript
boxShadow: {
  soft: "0 12px 30px rgba(15, 23, 42, 0.10)"
},
fontFamily: {
  sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Noto Sans TC", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji"]
  // Noto Sans TC 為繁體中文主力字型（第 6 位），前方為系統預設後備字型
}
```

### 3.5 模態框顯示/隱藏

```javascript
// 顯示模態框（不使用 Tailwind .hidden，因需覆蓋 CSS display 屬性）
loginModal.style.display = "flex";       // 開啟
loginModal.setAttribute("aria-hidden", "false");

// 隱藏模態框
loginModal.style.display = "none";      // 關閉
loginModal.setAttribute("aria-hidden", "true");
```

> 原因：`#loginModal` 的 CSS 可能有預設 `display` 屬性，僅靠 Tailwind `hidden` class 無法完全覆蓋，故使用 inline style。

---

## 四、JavaScript 開發規範

### 4.1 DOM 選取

- **一律使用** `$(id)` 快捷函數（`document.getElementById(id)`）
- 不得使用 `document.querySelector` 或 jQuery 選取器
- 每個 DOM 操作後檢查元素是否存在：`if (!host) return;`
- **唯一例外**：社群回覆按鈕（`.replyBtn`、`.cancelReplyBtn`、`.submitReplyBtn`）使用 `document.querySelectorAll`，因為這些按鈕是動態渲染後才存在於 DOM 中，且需批次綁定事件，無法用單一 ID 選取

### 4.2 資料獲取模式

```javascript
async function fetchXxx() {
  if (!globalThis.supabaseClient) return [];  // 連線檢查
  try {
    const { data, error } = await globalThis.supabaseClient
      .from("table_name")
      .select("*")
      .order("column");
    if (error) { /* 更新狀態文字 */ return []; }
    return data || [];
  } catch (err) { /* 更新狀態文字 */ return []; }
}
```

### 4.3 HTML 輸出安全

- **所有使用者輸入或動態文字**必須經過 `escapeHtml()` 處理
- HTML 特殊字元（`&` `<` `>` `"` `'`）會被轉義
- `generateDynamicTip()` 等生成 HTML 的函數，內部已呼叫 `escapeHtml()`

### 4.4 錯誤處理

- 使用 `try/catch` 包裹所有 Supabase 查詢與外部 API 呼叫
- 錯誤時回傳空陣列 `[]` 而非拋出例外，確保頁面不中斷
- 網路錯誤時更新對應的狀態 DOM 元素（如 `weatherUpdated`、`marketUpdated`）

### 4.5 Init 函數模式

```javascript
function initXxx() {
  // 1. 取得所有需要的 DOM 元素
  // 2. 檢查必要元素是否存在（if (!el) return;）
  // 3. 綁定事件監聽器
  // 4. 呼叫 supabaseClient.auth.onAuthStateChange 做登入狀態同步（如需要）
}
```

### 4.6 全域狀態管理

- `globalThis.supabaseClient`：Supabase 客戶端（supabaseClient.js）
- 模組層級 `let` 變數：`weatherData`、`allCropsCache`、`isRegisterMode`、`recommendedCropNames`、`selectedImageBase64`
- DOMContentLoaded 內 `let` 變數：`marketPricesCache`、`plantingRecordsCache`

---

## 五、Supabase 互動規範

### 5.1 客戶端初始化

```javascript
// supabaseClient.js（獨立檔案）
const SUPABASE_URL = "https://ahldlvrflijamguspxyi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGci...";  // anon key，前端公開使用

globalThis.supabaseClient = globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 5.2 查詢模式

- **RLS 隔離**：`planting_records` 與 `community_posts` 查詢必須帶 `.eq("user_id", session.user.id)`
- **認證檢查**：需登入的操作前先 `await supabaseClient.auth.getSession()`，檢查 `session?.user`
- **Service Key**（僅用於 Netlify Function）：具有完整讀寫權限，**不可**出現在前端程式碼中

### 5.3 新增功能時的資料庫步驟

1. 如需新欄位：在 Supabase Dashboard → Table Editor 新增
2. 如需 RLS 政策：在 Supabase Dashboard → Authentication → Policies 設定
3. 更新前端查詢程式碼
4. 更新本文檔的對應表格

### 5.4 登入/註冊流程細節

- 註冊成功後：顯示「註冊成功！請檢查 Email 確認信箱。」→ 2 秒後自動關閉模態框
- 登入成功：立即關閉模態框，`onAuthStateChange` 觸發 UI 更新
- Enter 鍵提交：密碼欄位監聽 `keydown` 事件，按 Enter 觸發 `submitLogin.click()`
- 錯誤訊息對照（前處理於 `initAuth()` 中）：
  - `Invalid login` → 「Email 或密碼錯誤」
  - `already registered` → 「此 Email 已註冊，請改用登入」
  - 其他 → 原始錯誤訊息直接顯示
- 登入狀態監聽：`onAuthStateChange` 觸發後自動刷新種植記錄與社群貼文

---

## 六、外部 API 呼叫規範

### 6.1 Open-Meteo

- `fetchTamsuiWeather()`：呼叫天氣 API 並更新 UI（天氣現象、氣溫、降雨、警示）；請求參數含 `weather_code`
- `fetchTamsuiWeatherWithData()`：只回傳 `{ temp, pop }`，不更新 UI（供其他函數使用）；不含 `weather_code`
- `fetchTamsuiWeeklyWeather()`：呼叫 daily API（`forecast_days=7`），回傳 `daily` 物件（含 `time`、`temperature_2m_max`、`temperature_2m_min`、`weather_code`、`precipitation_probability_max`）
- `renderWeeklyWeather(dailyData)`：渲染 7 個日曆卡片（`grid-cols-7`），顯示星期、天氣現象、最高/最低溫、降雨機率，當天用 `bg-leaf-50` 綠色高亮
- 座標固定：淡水 (25.1762, 121.4487)

### 6.2 Plant.id（透過 Netlify 代理）

- 前端上傳照片（FileReader → base64）→ POST `/api/plant-diagnosis`
- 照片限制：最大 5MB，格式 JPG/PNG
- Netlify Function 剝離 `data:image/...;base64,` 前綴後呼叫 Plant.id

### 6.3 市場行情更新

**後端（update-market.js）**：
- 手動更新：點擊市場行情區「🔄 更新」按鈕 → POST `/api/update-market`
- Netlify Function 從 `FarmTransData` 抓取全台當日行情
- 篩選條件：種類代碼 `N04`（蔬菜類）+ 市場（三重區、板橋區、台北一、台北二）+ 平均價 > 0
- 分組合計交易量 → 名稱轉換（`NAME_MAP` 85+ 組）→ DELETE 全表 → INSERT 全部（約 264 種蔬菜）
- 趨勢計算：`up`（上價 > 均價×1.3）/ `down`（中價 < 均價×0.85）/ `stable`

**前端（renderMarketPrices）**：
- 依 `price_avg` 遞減排序，預設顯示前 10 名（renderMarketTable + renderMarketMobile）
- 超過 10 種時顯示下拉選單（marketFilterRow / marketCropFilter），最多顯示 50 項
- 每列自動對照 `recommendedCropNames` 標記「本月推薦」綠色背景 + 徽章

**前端均價對應（findMarketPrice）**：
- 三層比對：精確 → 雙向包含 → broadMap 關鍵字映射（31 組）
- broadMap 將品種名映射到泛稱（例：`白梗空心菜` 含 `空心菜` → `空心菜`）
- 如有 crop.tip 則直接顯示，不查市場價
- 編碼注意：寫入 Supabase 必須用 `ensure_ascii=False` + UTF-8，PowerShell 的 ConvertTo-Json 會導致中文亂碼

---

## 七、新增功能的開發流程

### 7.1 準備階段

1. 閱讀 `docs/project-overview.md` 了解專案全貌
2. 閱讀 `docs/api-and-schema.md` 了解資料表結構與 API
3. 閱讀本文檔了解命名與程式慣例
4. 如涉及新資料表，先在 Supabase Dashboard 建立

### 7.2 實作步驟

1. **HTML 結構**：在 `index.html` 對應位置新增區塊（遵循現有 Tailwind 元件模式）
2. **資料獲取函數**：`fetch` 前綴，連線檢查 → Supabase 查詢 → 錯誤處理
3. **渲染函數**：`render` 前綴，清空 host → 遍歷資料 → 建立 DOM → appendChild
4. **事件綁定**：在 `DOMContentLoaded` 中綁定按鈕點擊事件
5. **Init 函數**（如需要）：`init` 前綴，處理 UI 初始化

### 7.3 初始化流程（DOMContentLoaded 模式）

```javascript
window.addEventListener("DOMContentLoaded", () => {
  // 1. 天氣先發（Promise 並行）
  const weatherPromise = fetchTamsuiWeatherWithData()...;

  // 2. 推薦作物 + 天氣一起完成後渲染
  Promise.all([fetchCrops(), weatherPromise]).then(([data]) => {
    recommendedCropNames = new Set(...);
    fetchMarketPrices().then(prices => {
      renderMonthlyRecommendations(data, prices, weatherData);
      renderMarketPrices(prices);
    });
  });

  // 3. 其他不互相依賴的資料並行載入
  fetchAllCrops().then(renderEncyclopedia);
  fetchPlantingCalendar().then(renderPlantingCalendar);
  // ...

  // 4. UI 初始化
  initDiagnosisUI();
  initAuth();
  refreshCommunity();
});
```

### 7.4 驗證步驟

1. 在本機執行 `python -m http.server 8000` 測試
2. 確認所有 Supabase RLS 政策正確（未登入只能讀公開資料）
3. 確認 Service Worker 未誤快取外部 API 請求
4. 確認手機版（< 768px）UI 正常顯示
5. `git diff` 確認改動範圍，提交前做最後檢查

### 7.5 生長階段計算（兩套獨立系統）

| 系統 | 函數 | 閾值（天數） | 階段 |
|------|------|-------------|------|
| 種植記錄顯示 | `renderPlantingRecords()` | ≤7 / ≤21 / ≤35 / >35 | 育苗期 → 生長期 → 成熟期 → 可採收 |
| 採收建議 | `generateHarvestSuggestions()` | ≥30 | 接近採收期（附市場價 + 氣象提醒） |
| 採收建議（半） | `generateHarvestSuggestions()` | ≥15 且 <30 | 生長期（顯示預計剩餘天數） |

> 兩套系統閾值不同，修改時需區分對應函數。

---

## 八、Git 與部署規範

### 8.1 Git 操作

| 指令 | 用途 |
|------|------|
| `git status` | 檢查改動範圍 |
| `git diff` | 確認修改內容 |
| `git add <file>` | 暫存修改 |
| `git commit -m "描述"` | 提交 |
| `git push origin main` | 推送 → Cloudflare Pages 自動部署 |

### 8.2 Commit 訊息格式

```
<類型>: <簡短描述>

- 詳細改動 1
- 詳細改動 2
```

類型範例：`feat:`（新功能）、`fix:`（修正）、`refactor:`（重構）、`docs:`（文件）、`style:`（樣式）。

### 8.3 .gitignore

當前排除：`.DS_Store`、`Thumbs.db`、`node_modules/`、`.vscode/`、`android-sdk/`、`android/build/`、`android/.gradle/`、`android/debug.keystore`

### 8.4 部署

- **本地開發**：在專案根目錄執行 `python -m http.server 8000`，瀏覽器打開 `http://localhost:8000/`
- **主部署**：`git push origin main` → Cloudflare Pages 自動部署（1-2 分鐘）
- **APK 建構**：執行 `build-apk.ps1`（需安裝下列環境，缺一不可）：
  - JDK 17（安裝於 `C:\jdk-17`）
  - Android SDK（置於專案 `android-sdk\` 目錄下）
    - build-tools `34.0.0`（含 aapt2.exe、zipalign.exe、apksigner.bat、d8.bat）
    - platforms `android-34`（含 android.jar）
  - 簽署用 keystore：自動生成於 `android\debug.keystore`（alias=debug, 密碼=android）
- **Netlify Functions**：備用部署方案，主要處理 API 代理

---

## 九、Service Worker 規範

- 快取名稱：`CACHE_NAME = 'tamsui-seedling-v1'`
- 快取資源：`/`、`/index.html`、`/supabaseClient.js`、`/manifest.json`、Tailwind CDN、Supabase CDN
- **排除快取規則**（這四個來源的請求直接穿透，不進快取）：
  ```javascript
  if (url.origin.includes('supabase.co') ||
      url.origin.includes('open-meteo.com') ||
      url.origin.includes('data.moa.gov.tw') ||
      url.origin.includes('plant.id')) {
    return;  // 不攔截，讓瀏覽器直接發送請求
  }
  ```
- 快取策略：Cache First，新資源取回後自動更新快取
- 版本更新：修改 `CACHE_NAME`（如 `tamsui-seedling-v2`）觸發舊快取清除

---

## 十、安全性注意事項

| 項目 | 規範 |
|------|------|
| API Key | Plant.id Key 僅存在 `netlify/functions/plant-diagnosis.js`，前端不透出 |
| Supabase Key | Anon Key 在前端公開是正常設計；Service Key 僅存 `update-market.js`，不出現在前端 |
| RLS | `planting_records` 與 `community_posts` 必須啟用 RLS，依 `user_id` 隔離 |
| HTML 輸出 | 所有動態內容使用 `escapeHtml()` 防止 XSS |
| 密碼 | 透過 Supabase Auth 處理，前端不直接操作密碼雜湊 |

---

## 十一、常用程式碼片段

### Supabase 查詢

```javascript
// 基本查詢
const { data, error } = await globalThis.supabaseClient
  .from("table_name")
  .select("*")
  .order("column", { ascending: false });

// 條件過濾（陣列包含）
.from("crops").select("*").contains("months", [String(currentMonth)]);

// 條件過濾（等於）
.from("planting_records").select("*").eq("user_id", session.user.id);

// 條件過濾（IS NULL）
.from("community_posts").select("*").is("parent_id", null);

// 條件過濾（IN）
.from("community_posts").select("*").in("parent_id", postIds);

// 插入
.from("table_name").insert([{ column1: value1, column2: value2 }]);
```

### DOM 操作

```javascript
const $ = (id) => document.getElementById(id);

// 安全操作 DOM
const host = $("someContainer");
if (!host) return;
host.innerHTML = "";  // 清空
// ... 建立元素
host.appendChild(el);
```

### 登入狀態檢查

```javascript
const { data: { session } } = await globalThis.supabaseClient.auth.getSession();
if (!session?.user) {
  alert('請先登入！');
  return;
}
// session.user.id → user_id
// session.user.email → user_email
```
