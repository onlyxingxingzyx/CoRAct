/*
 * CoRAct site configuration / 网页信息集中配置
 * Leave unavailable links empty. They will not link to a fake URL.
 * 无需修改 HTML：把真实链接、作者和视频路径填在这里即可。
 * All asset paths are relative so a /CoRAct/ project site works correctly.
 */
window.CORACT_CONFIG = {
  siteUrl: "",          // e.g. https://YOUR_USERNAME.github.io/CoRAct/
  paperUrl: "static/paper.pdf",
  codeUrl: "",          // Actual model/code repository, NOT necessarily this website repository.
  arxivUrl: "",         // e.g. https://arxiv.org/abs/YOUR_PAPER_ID
  videoSrc: "",         // Put video at static/videos/overview.mp4, then enter that relative path.
  videoPoster: "",      // Optional poster image, e.g. static/images/video-poster.jpg
  videoCaptions: "",    // Optional English WebVTT subtitles, e.g. static/videos/overview.en.vtt
  videoCaptionLanguage: "en",
  videoCaptionLabel: "English",
  authors: [
    // { name: "Full Name", url: "https://your-homepage.example/", affiliations: "1", equal: true },
    // { name: "Second Author", url: "", affiliations: "1,2", equal: false }
  ],
  affiliations: [
    // { id: "1", name: "University / Laboratory" },
    // { id: "2", name: "Second Institution" }
  ],
  venue: "",            // Add only a verified venue/status; no acceptance is assumed.
  bibtex: ""            // Paste the complete published BibTeX string between backticks (`...`).
};
