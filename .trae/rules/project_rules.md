# 淡水農友助手 — 專案開發規則（AI 自動遵守）

## 核心規則

1. **每次修改程式碼後**，必須同步更新 `docs/` 目錄下的三份核心文件：
   - `docs/project-overview.md`
   - `docs/api-and-schema.md`
   - `docs/dev-rules.md`

2. **觸發條件**：只要修改了以下任一檔案，就必須檢查並更新 docs：
   - `index.html`（前端邏輯、DOM 結構、函數、變數）
   - `functions/api/*.js`（Cloudflare Pages Functions API 代理）
   - `supabaseClient.js`（連線設定）
   - `sw.js`、`manifest.json`、`build-apk.ps1`
   - Supabase 資料表結構（欄位增刪、RLS 政策）
   - `netlify/functions/` 保留備援，修改時亦須更新 docs

3. **更新原則**：
   - 不要等使用者提醒，主動自動更新
   - 如果只改了 docs 本身（錯字、補充說明），不需要更新其他檔案
   - 更新後 commit message 使用 `docs:` 前綴

## 部署流程

4. Cloudflare Pages 自動部署：`git push origin main` 後 1-2 分鐘生效
5. 推送前先 `git status` + `git diff` 確認範圍
6. 如 SSL 失敗，改用 `git -c http.sslBackend=openssl push origin main`

## 資料更新

7. Supabase `market_prices` 表更新需用 Python（UTF-8），不能用 PowerShell（會亂碼）
8. `functions/api/update-market.js` 的 Cloudflare Pages Function 部署後不會自動執行，需手動觸發或直接寫入 Supabase

## 專案特性

9. 純靜態站，無 `package.json` / `node_modules`
10. 所有功能在單一 `index.html`（~1,900+ 行）
11. Supabase anon key 公開在前端是正常設計
12. Plant.id API Key 和 Supabase Service Key 只能存在 Cloudflare Pages Functions（`functions/api/`）和 Netlify Functions
