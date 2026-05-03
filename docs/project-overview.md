# 淡水農友助手 — 專案總覽

> **部署網址**：https://tamsui-seedling-app.pages.dev  
> **最後更新**：2026-05-03  
> **版本**：v2（基礎版已全功能上線）

---

## 一、專案目標

「淡水農友助手」是淡水菜苗專賣店的農民資訊 Web App。目標是讓淡水地區農友能在一處取得完整種植所需資訊：**即時天氣、適合種植的菜苗、種植曆、病蟲害診斷、市場行情、採收建議**，並提供會員系統保存個人種植記錄，以及社群交流功能。

---

## 二、技術堆疊

| 層級 | 技術 | 說明 |
|------|------|------|
| 前端 | HTML + Tailwind CSS (CDN) + Vanilla JS | 單一 `index.html`，約 1,950 行，無建構步驟 |
| 後端即服務 | Supabase | 雲端 PostgreSQL + Auth 會員認證 + RLS 權限 |
| 天氣 API | Open-Meteo | 免費無需 Key，淡水座標 25.1762, 121.4487 |
| AI 診斷 | Plant.id v3 health_assessment | 每月 10 次免費，透過 Cloudflare Pages Function 代理 |
| 市場行情 | 農業部開放資料 FarmTransData + 農糧署農情預測 | 政府開放 API，免費 |
| 託管 | Cloudflare Pages | 靜態站 + Functions 自動部署，全球 CDN |
| PWA | manifest.json + Service Worker | 離線快取、手機桌面安裝 |
| Android | WebView 包裝 APK | `android/` 目錄，`build-apk.ps1` 建構（需 JDK 17 + Android SDK 34） |
| 版本控制 | Git + GitHub | 帳號 kittenmay / lin036@gmail.com |
| 字型 | Tailwind fontFamily.sans | `ui-sans-serif` → `system-ui` → `-apple-system` → `Segoe UI` → `Roboto` → **`Noto Sans TC`**（繁體中文主力） → `Helvetica` → `Arial` |
| CDN 版本 | Supabase SDK `@2`、Tailwind CSS 3.x (CDN) | 不鎖定版號，自動取最新兼容版；具體 URL 見下方 |
| Apple 相容 | apple-touch-icon / apple-mobile-web-app-* | 支援 iOS 主畫面安裝與全螢幕模式 |
| Favicon | inline SVG（🌱 emoji） | 不依賴外部圖片檔 |

**核心原則**：純靜態站，無 `package.json`、無 Node.js 建構步驟。

---

## 三、已完成功能（11 項全上線）

| # | 功能 | 說明 |
|---|------|------|
| ✅ | **淡水即時氣象** | Open-Meteo 每小時天氣，23 種中文天氣對照，高溫 >32°C / 降雨 >70% 自動警示 |
| ✅ | **未來七天預報** | 每日最高/最低溫、天氣現象、降雨機率，當天綠色高亮 |
| ✅ | **本月推薦種植** | Supabase `crops` 表按月篩選，卡片含完整五階段生長建議（🌱育苗→🪴定植→🌿生長→🌸開花結果→🧺採收）+ 月份特性 + 氣象動態警示 + 市場均價徽章 |
| ✅ | **種植記錄與生長追蹤** | 4 階段自動計算：育苗期 → 生長期 → 成熟期 → 可採收，RLS 依 user_id 隔離 |
| ✅ | **淡水種植曆** | 1~12 月完整種植提醒，當月自動綠色高亮標示 |
| ✅ | **菜苗百科 + 搜尋** | 143 筆作物，含品種、季節、分類，支援關鍵字搜尋 |
| ✅ | **拍照診斷病蟲害** | Plant.id AI 辨識，17 種中文病害名稱映射，附處理建議 |
| 🆕 | **市場行情 & 採收建議** | 台北三重/板橋批發全部蔬菜行情（264 種），依均價排序預設顯示前 10 名 + 下拉選單查詢其餘作物，本月推薦卡片自動對應市場均價 |
| ✅ | **會員登入** | Supabase Auth：Email 註冊/登入，RLS 權限隔離 |
| ✅ | **農友社群** | 發文討論 + 回覆交流，需登入後參與 |
| ✅ | **PWA** | `manifest.json`（theme_color `#0e8555`）+ Service Worker 離線快取 |
| ✅ | **Android APK** | WebView 包裝，`build-apk.ps1` 一鍵建構 |

---

## 四、待辦 / 未來擴展

| # | 項目 | 狀態 |
|---|------|------|
| 🔲 | 菜苗資料擴充（店家完整品項錄入） | 規劃中 |
| 🔲 | 品牌 Logo 與配色更換 | 規劃中 |
| 🔲 | 自訂網域（如 tamsui-seedling.com.tw） | 規劃中 |
| 🔲 | 推播通知（生長到期、天氣警報） | 規劃中 |
| 🔲 | 資料儀表板（價格走勢、種植統計圖表） | 規劃中 |
| 🔲 | 作物全週期管理（播種→育苗→定植→施肥→採收引導） | 規劃中 |
| 🔲 | `farm_forecast` / `farm_origin_prices` 前端介面 | 資料表已就緒，前端待開發 |

---

## 五、資料庫結構（Supabase · 7 張表）

| 資料表 | 筆數 | 用途 | 前端引用 |
|--------|------|------|----------|
| `crops` | 143 | 菜苗品種（名稱、品種、生長天數、澆水頻率、適合月份、小撇步、季節、分類） | 本月推薦、下拉選單、百科 |
| `planting_calendar` | 12 | 1~12 月種植提醒 | 種植曆 |
| `planting_records` | 使用者新增 | 種植記錄（作物、日期、備註、user_id），RLS 隔離 | 我的種植記錄 |
| `market_prices` | 264 | 台北三重/板橋市場行情（最低/最高/均價、漲跌趨勢），涵蓋全部 N04 蔬菜類 | 市場行情、採收建議、本月推薦均價徽章 |
| `farm_forecast` | 200 | 農糧署農情預測 | 未使用（預留） |
| `farm_origin_prices` | 277 | 農產品產地價格 | 未使用（預留） |
| `community_posts` | 使用者新增 | 社群討論（主文/回覆，parent_id 關聯） | 農友社群 |

**RLS 政策**：`planting_records` 與 `community_posts` 依 `user_id` 隔離，確保農民只能存取自己的資料。

---

## 六、外部 API

| API | 端點 | 認證 | 用途 |
|-----|------|------|------|
| **Open-Meteo** | `https://api.open-meteo.com/v1/forecast?latitude=25.1762&longitude=121.4487&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=1&timezone=Asia/Taipei` | 無 | 每小時氣溫、降雨機率、天氣代碼 |
| **Plant.id** | `POST https://api.plant.id/v3/health_assessment`（透過 `/api/plant-diagnosis` Netlify 代理） | API Key | AI 病害診斷，回傳健康狀態、病害名稱、機率、處理建議 |
| **農業部批發** | `GET https://data.moa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx` | 無 | 每日批發市場行情，update-market.js 抓取全部蔬菜類（N04）交易記錄，依交易量排序，透過 NAME_MAP（85+ 組）將政府名稱轉為常用中文名稱後全部寫入 Supabase |
| **農糧署農情** | 農糧署開放資料 (UnitId=4P84xEv6hd22) | 無 | 種植面積、產量預測（已匯入 farm_forecast） |
| **農糧署產地價** | 農糧署開放資料 (UnitId=WVOiWSdDjWxx) | 無 | 歷史產地價格（已匯入 farm_origin_prices） |

### Cloudflare Pages Functions（API 代理）

| 路由 | Function 檔案 | 用途 |
|------|-------------|------|
| `/api/plant-diagnosis` | `functions/api/plant-diagnosis.js` | Plant.id API 安全代理（隱藏 API Key） |
| `/api/update-market` | `functions/api/update-market.js` | 觸發市場行情從政府 API 更新至 Supabase |

> 路由由 Cloudflare Pages 自動依據 `/functions/` 目錄結構對應，無需額外設定。

---

## 七、部署流程

```
修改程式碼 → git add → git commit → git push origin main
                                          ↓
                              Cloudflare Pages 自動部署（1-2 分鐘）
                                          ↓
                              https://tamsui-seedling-app.pages.dev
```

### APK 建構流程

**環境需求**：JDK 17（`C:\jdk-17`）+ Android SDK（`android-sdk\` 含 build-tools 34.0.0 + platforms android-34）

```
執行 build-apk.ps1
  → [1/6] aapt2 compile（資源編譯）
  → [2/6] aapt2 link（APK 連結，minSdk 21 / targetSdk 34）
  → [3/6] javac（Java 17 編譯）
  → [4/6] d8（DEX 轉換）
  → [5/6] zipalign（4 位元組對齊）
  → [6/6] apksigner（debug.keystore 簽署，密碼 android）
  → tamsui-seedling.apk
```

---

## 八、檔案結構

```
tamsui-seedling-app/
├── index.html                  ← 主程式（全部前端業務邏輯，~1,850 行）
├── supabaseClient.js           ← Supabase 連線初始化
├── manifest.json               ← PWA 設定（name: 淡水農友助手, theme_color: #0e8555）
├── sw.js                       ← Service Worker（快取名 tamsui-seedling-v1）
├── icon-192.png / icon-512.png ← PWA 桌面圖示
├── netlify.toml                ← Netlify 部署配置 + API 路由
├── build-apk.ps1               ← PowerShell APK 建構腳本
├── tamsui-seedling.apk         ← 已編譯 Android APK
├── 架構總覽.html               ← 系統架構總覽文件（可獨立瀏覽）
├── README.md                   ← 簡易說明
├── .gitignore
├── android/                    ← Android 原生 APP（Gradle + WebView 包裝）
│   ├── settings.gradle
│   ├── build.gradle
│   └── app/
│       ├── build.gradle         ← compileSdk 34, minSdk 21, targetSdk 34, Java 17
│       └── src/main/
│           ├── AndroidManifest.xml  ← 權限 INTERNET, label="農友助手", usesCleartextTraffic
│           ├── res/values/colors.xml
│           └── java/com/tamsui/seedling/MainActivity.java  ← WebView loadUrl + JS/DOM enabled
├── functions/                  ← Cloudflare Pages Functions（API 代理）
│   └── api/
│       ├── plant-diagnosis.js   ← Plant.id API 安全代理
│       └── update-market.js     ← 市場行情自動更新
├── netlify/                    ← Netlify（備援，可移除）
│   ├── netlify.toml
│   └── functions/
└── docs/                       ← 專案文檔
    ├── project-overview.md     ← 本文檔
    ├── api-and-schema.md       ← API 與資料庫詳細說明
    └── dev-rules.md            ← 開發規範
```

---

## 九、Service Worker 快取策略

- **快取名稱**：`tamsui-seedling-v1`
- **快取資源**：`/`、`/index.html`、`/supabaseClient.js`、`/manifest.json`、Tailwind CDN、Supabase CDN
- **排除快取（保持即時）**：`supabase.co`、`open-meteo.com`、`data.moa.gov.tw`、`plant.id`
- **策略**：Cache First（優先快取），外部 API 請求直接穿透不做快取

---

## 十、主題色系（Tailwind 自訂）

| 色系 | 用途 | 主要色值 |
|------|------|----------|
| `soil` | 土壤/背景 | #f7f3ee ~ #3a2816 |
| `leaf` | 植物/主色 | #0e8555（theme_color） |
| `sky` | 天空/資訊 | #2563eb |
| `sun` | 陽光/警示 | #d97706 |

自訂陰影：`shadow-soft`（`0 12px 30px rgba(15, 23, 42, 0.10)`）

---

## 十一、Android APK 細節

| 屬性 | 值 |
|------|-----|
| applicationId | `com.tamsui.seedling` |
| versionCode | 1 |
| versionName | `"1.0"` |
| minSdk | 21 |
| targetSdk | 34 |
| compileSdk | 34 |
| Java 版本 | 17 |
| AGP 版本 | 8.2.0（com.android.tools.build:gradle） |
| rootProject.name | `"TamsuiSeedling"` |
| 啟動圖示背景 | `#0E8555`（colors.xml: ic_launcher_background） |
| 啟動圖示前景 | `#FFFFFF`（colors.xml: ic_launcher_foreground） |
| 應用標籤 | 農友助手（AndroidManifest.xml: `android:label`） |
| 主題 | `Theme.Material.Light.NoActionBar` |
| 權限 | `INTERNET`（usesCleartextTraffic=true） |
| 螢幕適應 | `configChanges="orientation|screenSize"` |
