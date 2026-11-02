# 盖亚之书 · GAIA CODEX

把 14 份世界观文档（《盖亚之书》《苏海勒风俗志》《帕提斯种族表》《普罗米修编年史》《普罗米修职业表》《缇娜斯法则宝典》《因达瑞火山》《尼比鲁》《卡佩托缇娜》《芙洛纳》《乌尔维克》《卡塔瑞亚学院》《羲和百川》《索里纳》）整理成的静态世界观站点。

## 打开方式

直接双击 `site/index.html` 即可。全部为静态文件：无构建、无框架、无 CDN、无外链字体，断网也能完整显示。

如果偏好本地服务器：

```powershell
npx --yes serve site
```

## 结构与内容

```
site/
├─ index.html                首页：主视觉 / 世界观 / 12 势力 / 5 册档案 / 纪元 / 法则 / 引言带
├─ factions/                 12 个势力档案
│   ├─ solina xihe kataria urvik flona capetotina nibiru indar qingshi  （正文齐全）
│   └─ gondra fenrir poludni                                            （封存态）
├─ archive/
│   ├─ timeline.html         普罗米修编年史（4 个纪元 + 补充记载 + 名词释义）
│   ├─ laws.html             缇娜斯法则宝典（14 则）
│   ├─ races.html            帕提斯种族表（18 条目）
│   ├─ jobs.html             普罗米修职业表（25 条）
│   └─ customs.html          苏海勒风俗志（3 章 + 原书题字）
├─ assets/css               tokens / base / components / anim / pages 五层
├─ assets/js                core（交互）· anim（逐字入场、视差）· gallery（章节轨道）
├─ assets/img               38 张配图（WebP）+ 题字
├─ assets/fonts             Noto Serif SC / Noto Sans SC 按实际用字裁剪的子集（70 + 1 个 woff2）
├─ assets/img/credits.json  每张图的来源 URL
└─ CREDITS.md               配图来源与处理说明
```

## 设计说明

- **气质**：暗色（#08090a）+ 墨白（#e9e2d3）+ 黄铜（#c9a25e），无圆角、细线框、等宽小字标号；蒸汽朋克 × 魔法 × 中世纪。
- **动画**：首屏主视觉 Ken Burns 缓推、标题逐字升起、滚动揭示级联、章节轨道随滚动高亮、顶栏滚动态、索引抽屉 clip-path 展开、滚动进度线；全部只作用于 `transform / opacity / filter / clip-path`。
- **无障碍**：`prefers-reduced-motion` 全量降级、键盘可达的抽屉（焦点陷阱 + Esc）、可见焦点、44px 以上触控目标、跳至正文链接、无横向滚动（375 / 768 / 1024 / 1440 均已验证）。

## 内容处理原则

1. **原文优先**：站点正文一律照录文档原句，只做分段、加标题与小标题，不补写、不改写、不翻译。
2. **未写完 / 未写明的一律标注「权限未开放」**：
   - 贡德拉岛、芬尼尔、波卢德尼：只在名录里出现标语，无独立文档 → 封存页；
   - 《苏海勒风俗志》魔法井章节在「如果将海青石粉末均匀涂抹在井底时则会」处中断 → 原位插入「记载中断 · 权限未开放」块；
   - 《普罗米修职业表》中描述空白的条目（言灵使、奥术师、厄术使等）→ 标为「封存条目」；
   - 《帕提斯种族表》里的噬魂龙人原文即标注不开放 → 保持原文。
3. **文档内没有的内容不上站**：文档末尾的内部编号串（如 `——2171496187——`）、空占位段落均不渲染。

## 素材

- **配图全部来自 Unsplash**（经 picsum.photos 的 Unsplash CC0 镜像取原图），原始分辨率 2K–5K，无水印、无文字招牌，符合 Unsplash License（免费可商用、无需署名）。
- 统一后处理：按用途裁切 → 长边 3200px（方图 2400px）重采样 → **龙金调色**（暗部冷黑 / 中间调黄铜 / 高光暖白，降低饱和度）→ 顶部压暗与底部融底（保证叠字可读）→ UnsharpMask 轻微锐化 → WebP q88。因此 38 张图在色调上是一套的。
- 每张图的作者、Unsplash 原页、用途逐条列在 [CREDITS.md](CREDITS.md) 与 `assets/img/credits.json`。
- 例外：`assets/img/title-suhail.webp`（「苏海勒风俗志」篆书题字）取自原始 docx 内插图，非外部素材。
- 字体为 Noto Serif SC / Noto Sans SC 的开源子集，已本地内嵌，不请求任何外部字体服务。
