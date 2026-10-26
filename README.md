# CoRAct — Project Page (redesigned edition)

论文主页：**From Reasoning to Action: Consequence-Grounded Alignment for Vision-Language-Action Models**。

## 先预览

解压整个项目，用浏览器打开根目录的 `index.html`。不要单独移动 HTML：它依赖同目录的 `site.config.js` 和 `static/`。

网页使用原生 HTML / CSS / JavaScript，不需要 npm、React 或构建步骤。外部字体通过 Google Fonts 加载；网络不可用时自动使用系统字体，不影响页面功能。没有统计追踪脚本，也没有复制参考站的 Google Analytics ID。

## 修改链接、作者和视频：只编辑 site.config.js

```js
window.CORACT_CONFIG = {
  siteUrl: "https://YOUR_USERNAME.github.io/CoRAct/",
  paperUrl: "static/paper.pdf",
  codeUrl: "https://github.com/YOUR_USERNAME/YOUR_CODE_REPOSITORY",
  arxivUrl: "https://arxiv.org/abs/YOUR_PAPER_ID",
  videoSrc: "static/videos/overview.mp4",
  videoPoster: "",
  videoCaptions: "",
  videoCaptionLanguage: "en",
  videoCaptionLabel: "English",
  authors: [
    { name: "Full Name", url: "", affiliations: "1", equal: false }
  ],
  affiliations: [
    { id: "1", name: "University / Laboratory" }
  ],
  venue: "",
  bibtex: ""
};
```

上面只是填写格式，不是真实作者或链接。**仓库中实际配置保持未知字段为空**，不使用这些示例地址。

`codeUrl` 应是模型/训练代码仓库。若网页与模型代码分仓，不要误填成网页源码仓库。

`siteUrl` 用于 canonical / 社交分享信息；应填真实 GitHub Pages 地址，并以 `/` 结尾。为空也能浏览本地网页。

`arxivUrl` / `codeUrl` 为空时，按钮显示 pending 且不链接到虚假页面。不要填 `#` 充数。

### 放入介绍视频

1. 把视频复制到 `static/videos/overview.mp4`。
2. 把配置中的 `videoSrc` 改为 `"static/videos/overview.mp4"`。
3. 刷新页面。留白视频区会自动替换成带 controls 的播放器。

可选：`videoPoster` 为封面图片路径，`videoCaptions` 为 WebVTT 字幕路径。

不填 `videoSrc` 时不会发起空视频请求，也不加载其他论文的演示视频。

### 作者和引用

`authors` 和 `affiliations` 填真实信息后会替换匿名作者行；`venue` 只填写已经确认的论文状态。

将完整 BibTeX 赋给 `bibtex`，多行文本用反引号包裹，例如：

```js
bibtex: `这里替换为完整、真实的 BibTeX 条目`
```

这只是语法示例，不能当作论文引用发布。当前版本不生成虚构的作者、arXiv 编号或会议录用信息。

## 上传到 GitHub Pages

把**项目内部文件**放到仓库根目录，而不是上传 ZIP 或再套一层项目文件夹：

```text
CoRAct/
├── index.html
├── site.config.js
├── .nojekyll
├── README.md
├── CREDITS.md
├── LICENSE.txt
└── static/
    ├── paper.pdf
    ├── css/style.css
    ├── js/main.js
    ├── images/
    │   ├── favicon.svg
    │   ├── framework.png
    │   ├── generalization.png
    │   ├── agent-correction.png
    │   └── real-robot.png
    └── videos/
        └── README.txt
```

已经配置 GitHub Pages 的仓库，可更新对应文件后重新部署。路径全部为相对路径，兼容 `https://USERNAME.github.io/CoRAct/` 等项目子目录；不需要把图片路径改成以 `/static/` 开头的站点根路径。

这是本地生成的交付包，没有自动修改或发布任何 GitHub 仓库。

## 内容与图片来源

所有研究内容来自用户提供的 12 页论文，不借用 DIRECT 的结果、作者、单位标识或视频：

- Figure 1（第 4 页）：联合建模与动作噪声空间对齐。
- Figure 2（第 7 页）：RoboCasa / VLABench 泛化设置。
- Figure 3（第 9 页）：Agent-guided ECoT correction。
- Figure 4（第 9 页）：三项真实机器人实验。
- Table 1：两组基准完整数据，可切换查看。
- Table 2：组件消融，可展开查看。
- Table 3：对齐前后 position / rotation / gripper / waypoint 指标。
- Table 4：完整 2×2 alignment / correction 消融。
- Table 5：三项真机任务的全部方法对比，可展开查看。

配图从原 PDF 高分辨率裁切，仅去除页面周边正文，保留原图内部文字与子图结构，没有重绘或生成虚构图像。

### 发布前需要确认的原稿信息

1. **论文标题**：使用 PDF 首页标题，不使用与首页不同的上传文件名。
2. **匿名状态**：原 PDF 使用 Anonymous Author(s)，首页含 “Submitted ... Do not distribute.”；该 PDF 在包中原样保留。公开发布前请自行确认允许公开的作者信息及稿件版本。没有将其标成已录用论文。
3. **数值不一致**：Tables 1–2 的 RoboCasa 完整模型结果是 75.5%，§4.3 正文写 75.4%。网页使用表格值，并在 Results 下明确提供 reporting note。未擅自修改 PDF 或判断哪个数字才是最终结果。
4. **不要宣传所有列均最优**：VLABench T6 的 π₀ 为 32.2，CoRAct 为 30.0；网页保留这一结果，T3 的 34.4 也正确标为并列。
5. 视频、正式作者、单位、arXiv 链接、代码链接、正式 BibTeX 尚未提供，故保持留空/待补。

## 设计和功能

深海军蓝、草绿色、浅蓝、淡黄色的配色参考 DIRECT。保留浅色学术主页结构，重新实现布局和交互。

- 悬停柔光、点击脉冲反馈；键盘 focus 高亮。
- 首页 16:9 视频预留位。
- 章节导航、阅读进度、回到顶部。
- 原图点击放大，Escape 退出，恢复原焦点。
- 方法分阶段标签、benchmark 标签，可用方向键/Home/End 切换。
- 重点词的字重/颜色/荧光标记，等宽数据数字。
- 桌面、平板、手机响应式排版；表格在小屏内部横向滚动。
- 支持 prefers-reduced-motion；不自动播放视频。
- 没有外部 JavaScript 依赖和构建依赖。

## 编辑正文和颜色

正文：`index.html`。

配色：`static/css/style.css` 顶部的 `:root` 变量。

交互：`static/js/main.js`。

保留页脚的设计来源署名；更多信息见 `CREDITS.md` 和 `LICENSE.txt`。
