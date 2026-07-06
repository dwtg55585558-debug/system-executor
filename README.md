# System Executor

一個以「身份」而非「績效」為核心的交易紀律養成系統。標準 Vite + React 專案,不依賴 Claude Artifact 環境。

## 執行方式

```bash
npm install
npm run dev      # 開發模式,預設 http://localhost:5173
npm run build    # 產出 dist/ 靜態檔案
npm run preview  # 預覽 build 結果
```

## 資料儲存

這是獨立專案,不在 Claude.ai 沙盒裡執行,因此沒有 `window.storage` 這個 API。所有進度改用瀏覽器的 **localStorage** 儲存(`src/utils/storage.js`),資料只留在使用者自己的裝置與瀏覽器裡。

## AI Mentor(選用功能)

「系統」→「回顧任一天」→ AI Mentor 區塊可以呼叫 Claude API,產生「是否忠於系統 / 心理模式 / 偏差 / 明日唯一改善」的分析,且不接觸盈虧資料。

因為這是純前端專案,呼叫 Anthropic API 需要:

1. 你自己的 Anthropic API Key(在 [console.anthropic.com](https://console.anthropic.com) 取得)
2. Key 只會儲存在瀏覽器的 localStorage,不會上傳到任何第三方伺服器
3. 請求會加上 `anthropic-dangerous-direct-browser-access: true` header,允許瀏覽器直接呼叫

⚠️ **注意**:把 API Key 放在前端程式碼/瀏覽器裡,代表任何能存取這台裝置或瀏覽器 devtools 的人都能看到你的 Key。這個做法只適合「自己在本機使用」,**不要把 build 出來的網站公開部署給其他人使用**,否則你的 Key 額度可能被濫用。如果要多人使用,建議加一個小型後端(例如 Cloudflare Worker / Vercel Function)代為呼叫 API,前端不直接持有 Key。

## 資料夾結構

```
src/
  main.jsx                 # 掛載進入點
  App.jsx                  # 根組件:狀態注入、分頁路由、全域 modal
  styles/
    theme.js                # 色彩 / 字體 token
    global.css              # Tailwind 進入點 + 少量全域樣式
  hooks/
    useAppState.js          # 核心狀態:讀寫、EXP/Integrity、成就檢查
    useToast.js              # 輕量 toast 通知
  utils/
    constants.js            # 靜態遊戲資料(等級稱號、Boss、違規類型、成就…)
    levels.js               # EXP ↔ 等級換算
    helpers.js               # 日期、預設資料結構、Decision Risk Monitor 判斷、統計
    storage.js               # localStorage 讀寫封裝
  components/               # 共用/展示型元件(Card、Modal、Ring、Heatmap…)
  pages/                     # 五個分頁:HomeTab / PracticeTab / JournalTab / SystemTab / InsightTab
```

## 功能對照(與原 Claude Artifact 版本相同)

- Morning Calibration(每日開場儀式,僅出現一次)
- Home:Morning Mission + Daily Quest
- Practice:晨間計畫、交易前 Checklist、交易紀錄(可新增多筆、可編輯、保留 edit history)、System Validation(符合策略時強制檢查進場理由/停損/R值)、Decision Risk Monitor(五條件自動偵測 + System Check)、成功等待、抵抗誘惑、誠實記錄違規、Evening Reflection
- Journal:彙總今日交易、永久可編輯、Edit History、歷史回顧
- System:身份環(等級 + Integrity)、等級路徑、Integrity 趨勢圖(含原因/恢復方式文案)、心魔圖鑑、成就牆、重置進度
- Insight:策略遵守率/違規率/等待成功率、EXP 成長曲線、Decision Quality 趨勢、情緒分布、心魔頻率、28 天熱力圖
- Day Replay:點任一天可看到完整當日紀錄,包含 AI Mentor 分析

## 技術保證(維持原設計哲學)

- `addExp` 只能由明確定義的行為觸發(任務完成、符合策略、成功等待、Journal…),程式中沒有任何路徑讀取交易的 `pnl` 來計算 EXP。
- AI Mentor 送給 Claude 的資料**主動排除 `pnl` 欄位**,模型端完全看不到盈虧,結構性保證「AI 不評論盈虧」。
