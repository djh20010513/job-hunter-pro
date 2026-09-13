// 项目介绍 Word 版本生成脚本
// 用法: node scripts/build-intro-docx.js
// 依赖: docx (npm install docx)
// 输出: 项目介绍.docx (Word 2007+ .docx 格式)
//
// 字体策略:
//   中文:宋体 (与 PDF 版保持一致)
//   英文:Times New Roman
//   Word 会用读者系统上有的字体渲染,这两个字体 Windows/Mac/Linux 都有,兼容性最好
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ImageRun, PageBreak, BorderStyle
} = require('docx');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '项目介绍.docx');

// 6 张产品截图(复用 PDF 版的素材)
const SHOTS = [
  { file: 'intro-discover.png',  title: '① 职位发现',
    desc: '聚合 123+ 国内互联网公司职位,支持关键词 / 公司 / 城市 / 校招 / 社招多维筛选,一键跳转官网投递' },
  { file: 'intro-tracker.png',   title: '② 求职追踪',
    desc: 'Kanban 看板管理投递全生命周期,8 阶段状态流转 (待投递 → 已投递 → 一面 → ... → Offer),localStorage 持久化' },
  { file: 'intro-match.png',     title: '③ JD 匹配分析',
    desc: '关键词智能打分 0-100,匹配原因拆解 + 缺失关键词清单 + 改进建议' },
  { file: 'intro-optimize.png',  title: '④ 简历优化',
    desc: '基于 JD 解析简历段落,识别缺失关键词,生成 STAR 法则改写建议' },
  { file: 'intro-interview.png', title: '⑤ 面试准备',
    desc: 'DeepSeek 生成 10 道预测题 (3 基础 + 3 项目 + 2 技术 + 1 软素质 + 1 反问),STAR 答案可单独复制' },
  { file: 'intro-review.png',    title: '⑥ 面试复盘',
    desc: '浏览器内 Whisper 转录 MP4/M4A 面试录音,DeepSeek 分析表现 (评分 + 好的部分 + 待优化部分 + 逐题点评)' }
];

// ========== 字体常量 ==========
const FONT_CN = '宋体';
const FONT_EN = 'Times New Roman';

// ========== 工具函数 ==========
function cn(text, opts = {}){
  return new TextRun({
    text,
    font: { ascii: FONT_EN, eastAsia: FONT_CN, hAnsi: FONT_EN },
    size: opts.size || 22,  // half-points: 22 = 11pt
    bold: opts.bold || false,
    color: opts.color,
    ...opts
  });
}

function en(text, opts = {}){
  return new TextRun({
    text,
    font: { ascii: FONT_EN, eastAsia: FONT_EN, hAnsi: FONT_EN },
    size: opts.size || 22,
    bold: opts.bold || false,
    color: opts.color,
    italics: opts.italics || false,
    ...opts
  });
}

function p(text, opts = {}){
  const cnOpts = { ...opts };
  delete cnOpts.align;
  return new Paragraph({
    alignment: opts.align,
    spacing: { before: 100, after: 100, line: 320 },
    children: [cn(text, cnOpts)]
  });
}

function pEn(text, opts = {}){
  return new Paragraph({
    alignment: opts.align,
    spacing: { before: 100, after: 100, line: 320 },
    children: [en(text, opts)]
  });
}

function bullet(text){
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60, line: 300 },
    children: [cn(text, { size: 20 })]
  });
}

function h1(text){
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 200, line: 360 },
    children: [cn(text, { bold: true, size: 36, color: '6c8cff' })]
  });
}

function h2(text){
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120, line: 340 },
    children: [cn(text, { bold: true, size: 28, color: '1a2236' })]
  });
}

function hr(){
  return new Paragraph({
    border: { bottom: { color: 'e3e8f1', space: 1, style: BorderStyle.SINGLE, size: 6 } },
    spacing: { before: 120, after: 120 }
  });
}

function imageParagraph(imgPath, widthPct = 90){
  if(!fs.existsSync(imgPath)) return null;
  const data = fs.readFileSync(imgPath);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [new ImageRun({
      data,
      transformation: { width: 600, height: 360 }  // 近似 5:3 比例,Word 按原比例缩放
    })]
  });
}

// ========== 构建文档 ==========
const children = [];

// === 封面 ===
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 1200, after: 200 },
  children: [cn('职途 AI', { bold: true, size: 72, color: '1a2236' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 100, after: 100 },
  children: [cn('智能求职助手 · 一站式工作台', { size: 40, color: '6c8cff' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 100, after: 100 },
  children: [cn('聚合 · 追踪 · 匹配 · 优化 · 准备 · 复盘', { size: 24, color: '6c7587' })]
}));
// 网址放在 3 行副标题下方(用户要求)
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 200 },
  children: [en('https://www.job-hunter.xin/', { size: 26, color: '6c8cff' })]
}));

children.push(hr());

// === 项目概述 ===
children.push(h2('项目概述'));
children.push(p('「职途 AI」是一个面向求职者的端到端一站式工作台,聚焦国内互联网求职场景,覆盖从职位发现、投递追踪、JD 匹配、简历改写、面试准备,到面试后复盘的完整链路。'));
children.push(p('整个产品用纯前端 (HTML + CSS + 原生 JavaScript 单页应用) 实现,通过 Vercel 边缘部署自动 CI/CD。状态保存在浏览器 localStorage,无服务器、无数据库、无用户注册,打开即用,刷新不丢。'));

children.push(h2('技术亮点'));
children.push(bullet('浏览器内 ASR —— Transformers.js + Whisper-tiny (WebAssembly),零后端转录音频'));
children.push(bullet('LLM 集成 —— 通过 OpenAI 兼容协议调用 DeepSeek Chat,支持 JSON 模式结构化输出'));
children.push(bullet('CDN 模型懒加载 —— jsDelivr 按需加载 Whisper 模型 (~40MB,首次缓存)'));
children.push(bullet('离线优先 —— 123+ 真实职位数据内嵌,localStorage 缓存简历与追踪记录'));
children.push(bullet('响应式 UI —— 6 大模块在同一页面,深色主题 + 流畅动效'));

children.push(hr());

children.push(pEn('🌐 在线体验', { bold: true }));
children.push(pEn('https://www.job-hunter.xin/'));
children.push(pEn(''));
children.push(pEn('📦 开源仓库', { bold: true }));
children.push(pEn('github.com/djh20010513/job-hunter-pro'));

// === Vibe Coding 能力展示 ===
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1('Vibe Coding 能力展示'));
children.push(p('本项目是「Vibe Coding」(AI 协作式编程) 工作流的完整案例 —— 在 1 天的高强度迭代中中,与 Claude Code 协作完成从产品构思、UI 设计、状态管理、数据建模,到 LLM Prompt 工程、浏览器内 ML 模型集成、CDN 资源加载策略、性能优化、CI/CD 部署、真实线上问题修复的全链路工作。'));

children.push(h2('关键能力维度'));
children.push(bullet('产品架构 —— 6 大模块在同一 SPA 内共存,共享 state.jobs / state.trackers 单一数据源'));
children.push(bullet('Prompt 工程 —— 面试准备 / 面试复盘 / 简历优化的系统提示词针对场景定制,要求结构化 JSON 输出'));
children.push(bullet('ML 模型集成 —— 在浏览器内加载 Whisper WASM,处理 MP4 音轨提取 → 重采样 → 转录 → LLM 分析的完整流水线'));
children.push(bullet('异步错误处理 —— 401 / 402 / 429 / 网络错误 / JSON 解析错各自给出可执行的修复建议'));
children.push(bullet('部署运维 —— Vercel 自动部署从 main 分支推送触发,CDN 边缘缓存兼容处理'));
children.push(bullet('迭代响应 —— 浏览器缓存穿透、Tab 切换交互、动效视觉反馈等真实用户体验问题实时修复'));

children.push(h2('项目数据'));
children.push(bullet('代码量: ~2300 行 JS + ~250 行 CSS + 350 行 HTML (无任何框架依赖)'));
children.push(bullet('职位数据库: 123+ 条真实国内公司职位(大厂/中厂/小厂/AI 创业/校招)'));
children.push(bullet('文件数: index.html + app.js + data.js + styles.css + 4 个 README/配置文件'));
children.push(bullet('部署: Vercel 边缘节点,全球 HTTPS 自动签发,5+ 别名同步部署'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// === 6 张产品截图 ===
for(let i = 0; i < SHOTS.length; i++){
  const shot = SHOTS[i];
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.LEFT,
    children: [cn(shot.title, { bold: true, size: 36, color: '6c8cff' })]
  }));
  children.push(p(shot.desc, { color: '6c7587' }));
  const img = imageParagraph(path.join(ROOT, shot.file));
  if(img) children.push(img);
  if(i < SHOTS.length - 1){
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }
}

// === 技术栈 ===
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1('技术栈一览'));

const stack = [
  ['前端基础', 'HTML5 + CSS3 + 原生 ES2022 JavaScript,无 React/Vue 框架依赖'],
  ['样式', 'CSS Grid + Flexbox + CSS 变量主题,自定义暗色配色'],
  ['字体', '宋体(中文) + Times New Roman(英文)'],
  ['存储', '浏览器 localStorage (追踪数据、简历缓存、API Key)'],
  ['AI 能力', 'DeepSeek Chat (OpenAI 兼容协议) · JSON 模式结构化输出'],
  ['语音转录', 'Transformers.js + Whisper-tiny (浏览器内 WASM)'],
  ['音频处理', 'Web Audio API 解码 + 16kHz 重采样 + WAV 编码 (零依赖)'],
  ['PDF 生成', 'pdfkit (本次项目展示用)'],
  ['Word 生成', 'docx npm 包 (本次项目展示用)'],
  ['部署', 'Vercel 边缘节点 + 自动 HTTPS + GitHub 推送触发部署'],
  ['版本控制', 'Git + GitHub,5 个生产环境别名同步部署']
];
stack.forEach(([k, v]) => {
  children.push(new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [
      cn(k + ': ', { bold: true, color: '6c8cff', size: 22 }),
      cn(v, { size: 22 })
    ]
  }));
});

// 构建文档
const doc = new Document({
  creator: 'Vibe Coding Portfolio',
  title: '职途 AI · 智能求职助手 - 项目介绍',
  description: 'AI 求职工具演示 · Vibe Coding 能力展示',
  styles: {
    default: {
      document: { run: { font: '宋体' } }
    }
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 }
      }
    },
    children
  }]
});

// 写入文件
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log('✅ Word 生成完成: ' + OUT + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
});