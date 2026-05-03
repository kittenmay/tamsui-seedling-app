# 淡水農友助手 — API 與資料庫結構

> **Supabase URL**：`https://ahldlvrflijamguspxyi.supabase.co`  
> **部署網址**：`https://tamsui-seedling-app.pages.dev`

---

## 一、Supabase 資料庫結構

### 1.1 crops（菜苗資料）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | int8 (PK) | 主鍵 |
| `name` | text | 作物名稱（例：空心菜、小黃瓜） |
| `category` | text | 分類（葉菜、果菜、根莖、豆類） |
| `description` | text | 詳細描述 |
| `growth_days` | int4 | 生長天數 |
| `water_frequency` | text | 澆水頻率說明 |
| `months` | text[] | 適合種植月份（例：{3,4,5,6,7,8,9,10}） |
| `tip` | text | 種植小撇步（可為空，前端會動態生成） |
| `created_at` | timestamptz | 建立時間 |
| `season` | text | 季節分類：秋季（3-10月）、冬季（9-3月） |

**前端查詢方式**：

| 用途 | 程式碼位置 | 查詢語句 |
|------|-----------|----------|
| 本月推薦 | `fetchCrops()` | `.from("crops").select("*").contains("months", [String(currentMonth)])` |
| 下拉選單 | `loadCropOptions()` | `.from("crops").select("id, name")` |
| 百科全部 | `fetchAllCrops()` | `.from("crops").select("*").order("name")` |

**標準化函數**：`normalizeCrop(row)` 提供欄位別名相容（`name` / `crop_name` / `title`、`tip` / `tips` / `note`、`months` / `recommended_months`）。

**動態種植建議（`generateDynamicTip(cropName, currentMonth, tempNum, popNum)`）**：  
若 crop 無 `tip` 欄位值，前端會動態生成 HTML 格式的完整建議，包含：

1. **月份提醒**：依據 `monthFeature` 對照表（1~12 月各有專屬描述）
2. **五階段完整提示**（全部顯示，非隨機挑選）：
   - 🌱 育苗期：保持濕潤、避免直射、夜間保溫
   - 🪴 定植期：陰天或傍晚定植、株距 25-40cm、定植後澆透水
   - 🌿 生長期：每 7-10 天追肥、摘除側芽老葉、保持通風
   - 🌸 開花結果期：增加磷鉀肥、注意授粉、摘除畸形果
   - 🧺 採收前：採收前 3-5 天停水、清晨採收保持鮮度
3. **氣象動態警示**：
   - 降雨機率 >50% → ⚠️ 排水警告
   - 氣溫 >30°C → 🌡️ 遮蔭補水
   - 氣溫 <18°C → 🧥 保溫防寒

---

### 1.2 planting_calendar（種植曆）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | int8 (PK) | 主鍵 |
| `month` | int4 | 月份 (1-12) |
| `description` | text | 該月種植提醒 |
| `created_at` | timestamptz | 建立時間 |

**資料內容**：
| 月份 | 提醒 |
|------|------|
| 1 | 保護越冬作物 |
| 2 | 準備春季種植 |
| 3 | 天氣回暖，開始育苗 |
| 4 | 天氣轉暖，適合種植空心菜、小黃瓜 |
| 5 | 梅雨季，注意排水與病害預防 |
| 6 | 高溫高濕，建議清晨澆水 |
| 7 | 盛夏高溫，需遮蔭防曬 |
| 8 | 颱風季節，加強防風措施 |
| 9 | 天氣轉涼，適合種植高麗菜 |
| 10 | 秋季種植旺季 |
| 11 | 準備越冬作物 |
| 12 | 保護幼苗免受寒害 |

**前端查詢**：`fetchPlantingCalendar()` → `.from("planting_calendar").select("*").order("month")`

**手機版月份標籤**（`renderPlantingCalendar` 中的 `monthLabels` 對照表，僅用於手機卡片）：  
`1月='寒冬' / 2月='早春' / 3月='回暖' / 4月='轉暖' / 5月='梅雨' / 6月='高溫高濕' / 7月='盛夏' / 8月='颱風季' / 9月='轉涼' / 10月='秋季' / 11月='入冬' / 12月='寒冬'`

---

### 1.3 planting_records（種植記錄）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | int8 (PK) | 主鍵 |
| `user_id` | uuid (FK → auth.users) | 使用者 ID（RLS 依此欄位隔離） |
| `crop_id` | int8 | 對應 crops.id |
| `crop_name` | text | 作物名稱（冗餘儲存便於顯示） |
| `planted_date` | date | 種植日期 |
| `notes` | text | 備註 |
| `growth_stage` | text | 生長階段（前端計算，非必填） |
| `created_at` | timestamptz | 建立時間 |

**RLS 政策**：`SELECT` / `INSERT` 均限制 `user_id = auth.uid()`。

**前端查詢**：
- 讀取：`fetchPlantingRecords()` → `.from("planting_records").select("*").eq("user_id", session.user.id).order("planted_date", { ascending: false })`
- 新增：`addPlantingRecord()` → `.from("planting_records").insert([{ crop_id, crop_name, planted_date, notes, user_id }])`

**生長階段計算**（純前端邏輯，不存 DB）：

| 用途 | 函數 | 閾值 | 階段 |
|------|------|------|------|
| 種植記錄顯示 | `renderPlantingRecords()` | ≤7 / ≤21 / ≤35 / >35 天 | 育苗期 → 生長期 → 成熟期 → 可採收（共 4 階段） |
| 採收建議觸發 | `generateHarvestSuggestions()` | ≥30 天 | 接近採收期，顯示市場價格建議 |
| 採收建議（半程） | `generateHarvestSuggestions()` | ≥15 天且 <30 天 | 生長期，顯示「預計再 N 天可採收」 |

> **注意**：種植記錄的 4 階段與採收建議的 30/15 天閾值是兩套獨立系統，互不衝突。

---

### 1.4 market_prices（市場行情）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | int8 (PK) | 主鍵 |
| `crop_name` | text | 作物名稱（例：高麗菜、番茄、空心菜） |
| `variety` | text | 品種（例：初秋、牛番茄、小葉） |
| `market` | text | 市場名稱（台北三重/板橋批發） |
| `price_low` | numeric | 最低價（多市場加權平均） |
| `price_high` | numeric | 最高價（多市場加權平均） |
| `price_avg` | numeric | 均價（多市場加權平均） |
| `trend` | text | 漲跌趨勢（`up` / `down` / `stable`） |
| `updated_at` | text | 更新日期（格式：YYYY-MM-DD） |

**筆數**：264 種蔬菜（農業部 FarmTransData N04 蔬菜類，篩選三重/板橋地區全部交易記錄）

**前端查詢**：`fetchMarketPrices()` → `.from("market_prices").select("*").order("price_avg", { ascending: false })`

**自動更新**：`netlify/functions/update-market.js`（詳見 §2.3）從 `FarmTransData` 抓取 → 篩選 N04 蔬菜類 + 三重/板橋市場 → 依交易量分組合計 → 透過 NAME_MAP（85+ 組）轉為常用名稱 → DELETE 舊資料 → 全部 INSERT 至 Supabase。

**前端均價模糊比對**（`renderMonthlyRecommendations` 內的 `findMarketPrice(cropName)`）：
由於 `crops` 表為詳細品種名（例：`白梗空心菜`），而 `market_prices` 為泛稱（例：`空心菜`），前端採用三層比對：

1. **精確比對**：`crop.name.trim().toLowerCase()` 直接查 priceMap
2. **雙向包含**：遍歷 priceMap，檢查 `cn.includes(k) || k.includes(cn)`
3. **關鍵字映射（broadMap，31 組）**：若農產品名稱包含指定關鍵字則對應到市場作物名
   - 例：`白梗空心菜` 含 `空心菜` → 查價 `空心菜`
   - 例：`水果小黃瓜` 含 `黃瓜` → 查價 `小黃瓜`

**前端渲染**：`renderMarketPrices(data)` →
- 按 `price_avg` 遞減排序，預設顯示前 10 名（`renderMarketTable` + `renderMarketMobile`）
- 超過 10 種時顯示下拉選單（`marketFilterRow` / `marketCropFilter`，最多 50 項）
- 每列自動對照 `recommendedCropNames` 標記「本月推薦」綠色徽章
- 桌機用表格（`hidden md:block`），手機用卡片（`md:hidden`）

---

### 1.5 farm_forecast（農情預測）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | int8 (PK) | 主鍵 |
| （農糧署原始欄位） | — | 種植面積、產量預測、氣候影響等 |

**狀態**：資料已匯入 200 筆，前端尚未開發對應介面。

---

### 1.6 farm_origin_prices（產地價格）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | int8 (PK) | 主鍵 |
| （農糧署原始欄位） | — | 甘藍、胡瓜、番茄、萵苣等產地歷史價格 |

**狀態**：資料已匯入 277 筆，前端尚未開發對應介面。

---

### 1.7 community_posts（農友社群）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | int8 (PK) | 主鍵 |
| `user_id` | uuid (FK → auth.users) | 發文者 ID |
| `user_email` | text | 發文者 Email（顯示用） |
| `parent_id` | int8 (FK → community_posts.id，可為 null) | null = 主文，非 null = 回覆 |
| `title` | text | 標題（主文用，可為空） |
| `content` | text | 內容 |
| `created_at` | timestamptz | 發文時間 |

**前端查詢**：
- 主文：`fetchCommunityPosts()` → `.from("community_posts").select("*").is("parent_id", null).order("created_at", { ascending: false }).limit(30)`
- 回覆：`fetchCommunityPosts()` 內第二次查詢 → `.from("community_posts").select("*").in("parent_id", postIds).order("created_at", { ascending: true })`
- 渲染主文 + 回覆：`renderCommunityPosts(posts, isLoggedIn)`，含回覆按鈕與回覆表單的事件綁定（透過 `querySelectorAll`）
- 新增主文：`submitNewPost()` → `.from("community_posts").insert([{ title, content, user_id, user_email }])`
- 新增回覆：`submitReply(parentId, content)` → `.from("community_posts").insert([{ parent_id, content, user_id, user_email }])`
- 刷新：`refreshCommunity()` → 檢查登入狀態 → `fetchCommunityPosts()` → `renderCommunityPosts()`

---

## 二、外部 API 詳細規格

### 2.1 Open-Meteo 天氣 API

| 項目 | 說明 |
|------|------|
| 方法 | `GET` |
| URL | `https://api.open-meteo.com/v1/forecast` |
| 參數 | `latitude=25.1762`、`longitude=121.4487`、`hourly=temperature_2m,precipitation_probability,weather_code`、`forecast_days=1`、`timezone=Asia/Taipei` |
| 認證 | 無需 |
| 呼叫位置 | `fetchTamsuiWeather()`（更新 UI）、`fetchTamsuiWeatherWithData()`（僅回傳資料）、`fetchTamsuiWeeklyWeather()`（七天預報） |
| 回傳 | 每小時 `temperature_2m[]`、`precipitation_probability[]`、`weather_code[]`、`time[]` |
| 取用方式 | 取 `currentHour = new Date().getHours()` 對應索引值 |

**每日預報 API（七天）**：
| 項目 | 說明 |
|------|------|
| URL | `https://api.open-meteo.com/v1/forecast?latitude=25.1762&longitude=121.4487&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&forecast_days=7&timezone=Asia/Taipei` |
| 呼叫位置 | `fetchTamsuiWeeklyWeather()` → `renderWeeklyWeather(dailyData)` |
| 回傳 | `daily.time[]`、`daily.temperature_2m_max[]`、`daily.temperature_2m_min[]`、`daily.weather_code[]`、`daily.precipitation_probability_max[]` |
| 渲染 | 7 格日曆卡片（grid-cols-7），每格顯示星期、天氣表情符號、高/低溫、降雨機率，當天綠色高亮 |

**weather_code 對照表**（23 種）：

| Code | 中文 | Code | 中文 | Code | 中文 |
|------|------|------|------|------|------|
| 0 | 晴朗 | 1 | 晴時多雲 | 2 | 多雲 |
| 3 | 陰天 | 45 | 霧 | 48 | 霜 |
| 51 | 毛毛雨 | 53 | 小雨 | 55 | 中雨 |
| 61 | 陣雨 | 63 | 中陣雨 | 65 | 大雨 |
| 71 | 小雪 | 73 | 中雪 | 75 | 大雪 |
| 80 | 短時陣雨 | 81 | 陣雨 | 82 | 豪雨 |
| 95 | 雷陣雨 | 96 | 雷雨伴冰雹 | 99 | 強雷雨伴冰雹 |
| 56 | 凍毛毛雨 | 57 | 凍小雨 | 66 | 凍陣雨 |
| 67 | 凍大雨 | 77 | 雪粒 | 85 | 短時雪 |
| 86 | 大雪 |

---

### 2.2 Plant.id v3 病害診斷 API

| 項目 | 說明 |
|------|------|
| 方法 | `POST` |
| 端點 | `https://api.plant.id/v3/health_assessment` |
| 認證 | Header `Api-Key: jf2mt4tav6C05s3ODF0qpRb3Rezqi3VyfZ4z9ZAS73NlZyOcOV` |
| 代理路由 | `/api/plant-diagnosis`（由 Netlify `netlify/functions/plant-diagnosis.js` 處理） |
| 前端呼叫 | `initDiagnosisUI()` 中 `diagnoseBtn` 點擊 → `fetch("/api/plant-diagnosis", { method: "POST", body: JSON.stringify({ image }) })` |
| 請求格式 | `{ images: [base64_image], similar_images: true }` |
| 回傳格式 | `{ isHealthy: boolean, diagnoses: [{ name, nameZh, probability, details: { description, treatment } }], result: { isPlant, isHealthy } }` |

**中文病害名稱映射**（17 種）：

| 英文 | 中文 | 英文 | 中文 |
|------|------|------|------|
| Powdery Mildew | 白粉病 | Downy Mildew | 霜霉病 |
| Rust | 锈病 | Leaf Spot | 叶斑病 |
| Blight | 枯萎病 | Root Rot | 根腐病 |
| Anthracnose | 炭疽病 | Bacterial Wilt | 细菌性萎凋病 |
| Mosaic Virus | 花叶病毒 | Aphids | 蚜虫 |
| Spider Mites | 红蜘蛛 | Whitefly | 白粉虱 |
| Healthy | 健康 | Nutrient Deficiency | 养分缺乏 |
| Water Deficiency | 水分不足 | Overwatering | 浇水过多 |
| Sunburn | 日烧 |

**前端限制**：照片最大 5MB，格式 JPG/PNG。

**前端狀態管理**：`let selectedImageBase64 = null`（模組層級變數），由 `initDiagnosisUI()` 中的 FileReader 寫入、診斷時讀取、重設時清空。

**前端診斷結果 UI 細節**：
- 健康作物：綠色卡片 `✅ 作物看起來很健康！` + `未檢測到明顯病蟲害跡象。`
- 檢測到病害：琥珀色標題 `⚠️ 檢測到以下問題：`，每筆診斷含：
  - 中文病害名稱 + 機率百分比徽章
  - 機率進度條（>60% 紅色、>30% 琥珀色、其他黃色）
  - Plant.id 回傳的 `description` 與 `treatment` 處理建議（如有）
- API 回傳格式不符時：`分析完成，但未能確定具體問題。建議諮詢專業農技人員。`

**Netlify Function 流程**：接收前端 `{ image: dataURL }` → 剝離 `data:image/...;base64,` 前綴 → 呼叫 Plant.id → 回傳 3 筆診斷結果 + 中文名稱。

---

### 2.3 農業部批發市場 API（FarmTransData）

| 項目 | 說明 |
|------|------|
| 方法 | `GET` |
| URL | `https://data.moa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx` |
| 認證 | 無需 |
| 每日筆數 | 約 2,614 筆（含蔬菜 N04 775 筆、水果 N05、花卉 N06，19 個市場，852 種品項） |
| 呼叫位置 | `netlify/functions/update-market.js` |

**處理流程**：
1. 抓取全台當日行情（`FarmTransData`）
2. 篩選：種類代碼 `N04`（蔬菜類）+ 目標市場（三重區、板橋區、台北一、台北二）+ 平均價 > 0
3. 分組：依 `作物名稱` 合計 `交易量`
4. 名稱轉換：`NAME_MAP`（85+ 組）將政府名稱轉為常用中文名
   - `甘藍-初秋` → `高麗菜`
   - `蕹菜-小葉` → `空心菜`
   - `花胡瓜` → `小黃瓜`
   - 未在對照表中的以 `-` 拆分，前半為名稱、後半為品種
5. 計算價格：多市場的 `上價`/`中價`/`下價`/`平均價` 加權平均
6. **趨勢判斷**：`up`（上價 > 均價×1.3）/ `down`（中價 < 均價×0.85）/ `stable`（其他）
7. 寫入 Supabase：`DELETE` 全部舊資料 → 逐筆 `POST` 264 種蔬菜行情

**NAME_MAP 涵蓋作物**（85+ 組，持續擴充）：
甘藍類 → 高麗菜、蕹菜類 → 空心菜、花胡瓜 → 小黃瓜、番茄類 → 番茄、萵苣菜類 → 萵苣、絲瓜類 → 絲瓜、胡蘿蔔類 → 胡蘿蔔、蘿蔔類 → 白蘿蔔、包心白 → 包心白菜、青蔥類 → 青蔥、洋蔥 → 洋蔥、苦瓜類 → 苦瓜、茄子類 → 茄子、玉米類 → 玉米、花椰菜類 → 花椰菜、青花苔 → 青花菜、南瓜類 → 南瓜、辣椒類 → 辣椒、甜椒類 → 甜椒、豌豆類 → 豌豆、韭菜類 → 韭菜、菠菜類 → 菠菜、芹菜類 → 芹菜、冬瓜類 → 冬瓜、西瓜類 → 西瓜、小白菜類 → 小白菜

**注意**：寫入 Supabase 必須使用 UTF-8 編碼（`Content-Type: application/json; charset=utf-8` + `ensure_ascii=False`）。PowerShell 的 `ConvertTo-Json` 會導致中文亂碼，建議使用 Python 或 Node.js 處理。

---

### 2.4 Supabase Auth API

| 項目 | 說明 |
|------|------|
| SDK | `@supabase/supabase-js@2`（CDN 載入） |
| 初始化 | `globalThis.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)` |
| 註冊 | `supabaseClient.auth.signUp({ email, password })` |
| 登入 | `supabaseClient.auth.signInWithPassword({ email, password })` |
| 登出 | `supabaseClient.auth.signOut()` |
| 取得 Session | `supabaseClient.auth.getSession()` |
| 監聽狀態 | `supabaseClient.auth.onAuthStateChange((event, session) => { ... })` |
| UI 位置 | `index.html` 初始化 `initAuth()`，header 含 `loginBtn` / `logoutBtn` / `userGreeting` |

**登入/註冊模態框**：由 `isRegisterMode` 變數切換登入/註冊模式，含 Email + 密碼輸入、錯誤提示、成功提示。模態框顯示/隱藏使用 `loginModal.style.display = "flex"` / `"none"`（非 Tailwind `.hidden` class，因需覆蓋預設 CSS）。

**天氣 API 差異**：
- `fetchTamsuiWeather()` 請求參數含 `weather_code`（用於天氣現象文字顯示），並更新所有 UI
- `fetchTamsuiWeatherWithData()` 只請求 `temperature_2m,precipitation_probability`（不含 `weather_code`），僅回傳 `{ temp, pop }` 供其他函數使用

---

## 三、前端頁面與路由

本專案為**單頁應用（SPA）**，所有功能在 `index.html` 中，無傳統路由。以下為頁面區塊對照：

| 區塊 | DOM ID | 說明 |
|------|--------|------|
| 頁首 | `header` | Logo「苗」、標題「淡水農友助手」、登入/註冊按鈕 |
| 氣象儀表板 | `weatherTemp` / `weatherPop` / `weatherWx` / `weatherAlert` / `weeklyForecast` / `weeklyCards` | 淡水即時氣象三欄 + 警示 + 七天預報卡片 |
| 本月推薦 | `monthlyRecommendations` / `monthlyEmpty` | 2 欄作物卡片 |
| 種植記錄 | `plantingRecords` / `plantingEmpty` / `plantingForm` | 表單 + 記錄列表 |
| 拍照診斷 | `uploadBtn` / `imageInput` / `diagnoseBtn` / `diagnosisContent` | 雙欄（上傳 + 結果） |
| 市場行情 | `marketTableContent` / `marketMobileCards` / `refreshMarketBtn` / `marketFilterRow` / `marketCropFilter` | 桌機表格 + 手機卡片，預設前10名 + 下拉選單（最多50項） |
| 採收建議 | `harvestSuggestions` | 智慧採收建議列表（邏輯：種植≥30天→採收建議 + 市場價 + 氣象，≥15天→生長預估） |
| 農友社群 | `communityPosts` / `communityNewPost` / `communityEmpty` | 發文區 + 討論串 |
| 種植曆 | `calendarTableBodyContent` / `calendarMobileCards` | 桌機表格 + 手機卡片，當月高亮 |
| 菜苗百科 | `encyclopediaCards` / `encyclopediaSearch` | 卡片式網格 + 關鍵字搜尋 |
| 登入模態框 | `loginModal` | Email + 密碼表單 |
| 頁尾 | `footer` | © 年份 + 版權 |

**頁面架構總覽**：`架構總覽.html` 為獨立文件，可在瀏覽器直接開啟查看系統架構、功能清單、資料庫結構、API 清單、平台帳號、開發流程等資訊，採內嵌 CSS 不需外部依賴。

---

## 四、Netlify 路由設定（netlify.toml）

```toml
[build]
  command = ""
  publish = "."

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/plant-diagnosis"
  to = "/.netlify/functions/plant-diagnosis"
  status = 200

[[redirects]]
  from = "/api/update-market"
  to = "/.netlify/functions/update-market"
  status = 200
```

---

## 五、PWA 設定（manifest.json）

| 屬性 | 值 |
|------|-----|
| `name` | 淡水農友助手 |
| `short_name` | 農友助手 |
| `start_url` | `/` |
| `display` | standalone |
| `background_color` | `#f7f3ee`（soil-50） |
| `theme_color` | `#0e8555`（leaf-600） |
| `orientation` | portrait-primary |
| `lang` | zh-Hant |
| 圖示 | icon-192.png (192×192)、icon-512.png (512×512 + maskable) |
