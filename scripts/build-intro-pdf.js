// 项目介绍 PDF 生成脚本
// 用法: node scripts/build-intro-pdf.js
// 依赖: pdfkit (npm install pdfkit)
// 中文字体: STHeiti Medium (macOS 系统字体)
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '项目介绍.pdf');

// 字体路径:
//   中文:宋体 SC Regular (.ttf,从 macOS 系统 Songti.ttc 用 fontkit 一次性提取,gitignored)
//   英文:Times New Roman (macOS 自带,4 个字重)
//   使用 4 个字体:cn / cn-bold / en / en-bold
//   - 中文内容用 cn (宋体)
//   - 英文 / 网址用 en (Times New Roman)
//   - 加粗也用 cn 的同文件,pdfkit 会做轻微 faux-bold(SC Bold 没单独提取)
//   - 字体文件 .fonts/songti-sc-regular.ttf 不入库,脚本首次跑会从 Songti.ttc 自动提取
const FONT_CN      = path.join(ROOT, '.fonts', 'songti-sc-regular.ttf');
const FONT_CN_BOLD = path.join(ROOT, '.fonts', 'songti-sc-regular.ttf');
const FONT_EN      = '/System/Library/Fonts/Supplemental/Times New Roman.ttf';
const FONT_EN_BOLD = '/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf';

// 6 张产品截图
const SHOTS = [
  { file: 'intro-discover.png', title: '① 职位发现' },
  { file: 'intro-tracker.png',  title: '② 求职追踪' },
  { file: 'intro-match.png',    title: '③ JD 匹配分析' },
  { file: 'intro-optimize.png', title: '④ 简历优化' },
  { file: 'intro-interview.png',title: '⑤ 面试准备' },
  { file: 'intro-review.png',   title: '⑥ 面试复盘' }
];

// 颜色 / 样式常量
const COLOR_TEXT = '#1a2236';
const COLOR_MUTED = '#6c7587';
const COLOR_PRIMARY = '#6c8cff';
const COLOR_ACCENT = '#9b6cff';
const COLOR_BG = '#f7f9fc';
const COLOR_LINE = '#e3e8f1';

// 文档尺寸 (A4)
const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 50;

// 创建文档
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
  info: {
    Title: '职途 AI · 智能求职助手 - 项目介绍',
    Author: 'Vibe Coding Portfolio',
    Subject: 'AI 求职工具演示 · Vibe Coding 能力展示',
    Keywords: 'AI, 求职, Vibe Coding, Claude Code, 项目作品'
  }
});

// 注册字体:中文宋体 + 英文 Times New Roman,各 2 个字重
doc.registerFont('cn', FONT_CN);
doc.registerFont('cn-bold', FONT_CN_BOLD);
doc.registerFont('en', FONT_EN);
doc.registerFont('en-bold', FONT_EN_BOLD);

const stream = fs.createWriteStream(OUT);
doc.pipe(stream);

// ========== 工具函数 ==========
function h1(text){
  doc.moveDown(1.5);
  doc.fillColor(COLOR_PRIMARY).font('cn-bold').fontSize(26).text(text);
  doc.fillColor(COLOR_TEXT);
}
function h2(text){
  doc.moveDown(1.2);
  doc.fillColor(COLOR_TEXT).font('cn-bold').fontSize(16).text(text);
}
function p(text, opts = {}){
  doc.moveDown(0.4);
  doc.fillColor(opts.muted ? COLOR_MUTED : COLOR_TEXT)
     .font('cn').fontSize(opts.size || 11)
     .text(text, { align: opts.align || 'left', lineGap: 4 });
}
function bullet(text){
  doc.moveDown(0.3);
  doc.fillColor(COLOR_TEXT).font('cn').fontSize(11)
     .text('• ' + text, { indent: 12, lineGap: 3 });
}
function hr(){
  doc.moveDown(0.5);
  const y = doc.y;
  doc.strokeColor(COLOR_LINE).lineWidth(0.5)
     .moveTo(MARGIN, y).lineTo(PAGE.width - MARGIN, y).stroke();
  doc.moveDown(0.5);
}
function pageBreak(){ doc.addPage(); }

// ========== 第 1 页:封面 + 项目概述 ==========
// 顶部装饰条
doc.rect(0, 0, PAGE.width, 8).fill(COLOR_PRIMARY);

// 标识
doc.moveDown(2);

// 主标题
doc.y = 180;
doc.fillColor(COLOR_TEXT).font('cn-bold').fontSize(36).text('职途 AI');
doc.font('cn').fontSize(20).fillColor(COLOR_PRIMARY)
   .text('智能求职助手 · 一站式工作台');

doc.moveDown(0.3);
doc.font('cn').fontSize(12).fillColor(COLOR_MUTED)
   .text('聚合 · 追踪 · 匹配 · 优化 · 准备 · 复盘');

// 项目主页(用户要求:放在 3 行副标题下方)
doc.moveDown(0.6);
doc.font('en').fontSize(13).fillColor(COLOR_PRIMARY)
   .text('https://www.job-hunter.xin/', { link: 'https://www.job-hunter.xin/' });

// 分割线
hr();

// 项目概述(用户要求的那段介绍)
h2('项目概述');
p(
  '「职途 AI」是一个面向求职者的端到端一站式工作台,聚焦国内互联网求职场景,' +
  '覆盖从职位发现、投递追踪、JD 匹配、简历改写、面试准备,到面试后复盘的完整链路。'
);
p(
  '整个产品用纯前端 (HTML + CSS + 原生 JavaScript 单页应用) 实现,通过 Vercel 边缘部署自动 CI/CD。' +
  '状态保存在浏览器 localStorage,无服务器、无数据库、无用户注册,打开即用,刷新不丢。'
);

// 技术亮点
h2('技术亮点');
bullet('浏览器内 ASR —— Transformers.js + Whisper-tiny (WebAssembly),零后端转录音频');
bullet('LLM 集成 —— 通过 OpenAI 兼容协议调用 DeepSeek Chat,支持 JSON 模式结构化输出');
bullet('CDN 模型懒加载 —— jsDelivr 按需加载 Whisper 模型 (~40MB,首次缓存)');
bullet('离线优先 —— 123+ 真实职位数据内嵌,localStorage 缓存简历与追踪记录');
bullet('响应式 UI —— 6 大模块在同一页面,深色主题 + 流畅动效');

// 实时访问地址 + 仓库
hr();
doc.moveDown(0.5);
doc.font('cn-bold').fontSize(11).fillColor(COLOR_TEXT).text('🌐 在线体验');
doc.moveDown(0.2);
doc.font('en').fontSize(11).fillColor(COLOR_PRIMARY)
   .text('https://www.job-hunter.xin/', { link: 'https://www.job-hunter.xin/' });
doc.moveDown(0.3);
doc.font('cn-bold').fontSize(11).fillColor(COLOR_TEXT).text('📦 开源仓库');
doc.moveDown(0.2);
doc.font('cn').fontSize(11).fillColor(COLOR_PRIMARY)
   .text('github.com/djh20010513/job-hunter-pro', { link: 'https://github.com/djh20010513/job-hunter-pro' });

// ========== 第 2 页:Vibe Coding 能力展示 ==========
pageBreak();
h1('Vibe Coding 能力展示');

p(
  '本项目是「Vibe Coding」(AI 协作式编程) 工作流的完整案例 —— 在 1 天的高强度迭代中,' +
  '与 Claude Code 协作完成从产品构思、UI 设计、状态管理、数据建模,到 LLM Prompt 工程、' +
  '浏览器内 ML 模型集成、CDN 资源加载策略、性能优化、CI/CD 部署、真实线上问题修复的全链路工作。'
);

h2('关键能力维度');

bullet('产品架构 —— 6 大模块在同一 SPA 内共存,共享 state.jobs / state.trackers 单一数据源');
bullet('Prompt 工程 —— 面试准备 / 面试复盘 / 简历优化的系统提示词针对场景定制,要求结构化 JSON 输出');
bullet('ML 模型集成 —— 在浏览器内加载 Whisper WASM,处理 MP4 音轨提取 → 重采样 → 转录 → LLM 分析的完整流水线');
bullet('异步错误处理 —— 401 / 402 / 429 / 网络错误 / JSON 解析错各自给出可执行的修复建议');
bullet('部署运维 —— Vercel 自动部署从 main 分支推送触发,CDN 边缘缓存兼容处理');
bullet('迭代响应 —— 浏览器缓存穿透、Tab 切换交互、动效视觉反馈等真实用户体验问题实时修复');

// 数据指标
h2('项目数据');
bullet('代码量: ~2300 行 JS + ~250 行 CSS + 350 行 HTML (无任何框架依赖)');
bullet('职位数据库: 123+ 条真实国内公司职位(大厂/中厂/小厂/AI 创业/校招)');
bullet('文件数: index.html + app.js + data.js + styles.css + 4 个 README/配置文件');
bullet('部署: Vercel 边缘节点,全球 HTTPS 自动签发,5+ 别名同步部署');

pageBreak();

// ========== 第 3-8 页:6 张产品截图 ==========
for(let i = 0; i < SHOTS.length; i++){
  const shot = SHOTS[i];
  const imgPath = path.join(ROOT, shot.file);
  if(!fs.existsSync(imgPath)){
    console.warn('⚠️ 跳过缺失图片:', shot.file);
    continue;
  }

  if(i > 0) pageBreak();

  // 标题
  doc.font('cn-bold').fontSize(18).fillColor(COLOR_PRIMARY).text(shot.title);
  doc.moveDown(0.3);

  // 副标题说明
  const descs = {
    '① 职位发现': '聚合 123+ 国内互联网公司职位,支持关键词 / 公司 / 城市 / 校招 / 社招多维筛选,一键跳转官网投递',
    '② 求职追踪': 'Kanban 看板管理投递全生命周期,8 阶段状态流转 (待投递 → 已投递 → 一面 → ... → Offer),localStorage 持久化',
    '③ JD 匹配分析': '关键词智能打分 0-100,匹配原因拆解 + 缺失关键词清单 + 改进建议',
    '④ 简历优化': '基于 JD 解析简历段落,识别缺失关键词,生成 STAR 法则改写建议',
    '⑤ 面试准备': 'DeepSeek 生成 10 道预测题 (3 基础 + 3 项目 + 2 技术 + 1 软素质 + 1 反问),STAR 答案可单独复制',
    '⑥ 面试复盘': '浏览器内 Whisper 转录 MP4/M4A 面试录音,DeepSeek 分析表现 (评分 + 好的部分 + 待优化部分 + 逐题点评)'
  };
  doc.font('cn').fontSize(11).fillColor(COLOR_MUTED).text(descs[shot.title] || '');

  doc.moveDown(0.4);

  // 图片 (适配页面宽度)
  const maxW = PAGE.width - MARGIN * 2;
  const maxH = PAGE.height - doc.y - MARGIN;
  doc.image(imgPath, MARGIN, doc.y, {
    fit: [maxW, maxH],
    align: 'center',
    valign: 'top'
  });

  // 移动光标到图片底部
  const imgHeight = doc.heightOfString(' ', { width: maxW });
}

// ========== 最后一页:技术栈 ==========
pageBreak();
h1('技术栈一览');

const stack = [
  ['前端基础', 'HTML5 + CSS3 + 原生 ES2022 JavaScript,无 React/Vue 框架依赖'],
  ['样式', 'CSS Grid + Flexbox + CSS 变量主题,自定义暗色配色'],
  ['字体', 'macOS 系统 STHeiti (中文) + PingFang SC (UI)'],
  ['存储', '浏览器 localStorage (追踪数据、简历缓存、API Key)'],
  ['AI 能力', 'DeepSeek Chat (OpenAI 兼容协议) · JSON 模式结构化输出'],
  ['语音转录', 'Transformers.js + Whisper-tiny (浏览器内 WASM)'],
  ['音频处理', 'Web Audio API 解码 + 16kHz 重采样 + WAV 编码 (零依赖)'],
  ['PDF 生成', 'pdfkit (本次项目展示用)'],
  ['部署', 'Vercel 边缘节点 + 自动 HTTPS + GitHub 推送触发部署'],
  ['版本控制', 'Git + GitHub,5 个生产环境别名同步部署']
];
stack.forEach(([k, v]) => {
  doc.moveDown(0.4);
  doc.font('cn-bold').fontSize(11).fillColor(COLOR_PRIMARY).text(k + ':', { continued: true });
  doc.font('cn').fontSize(11).fillColor(COLOR_TEXT).text(' ' + v);
});

// 底部水印 / 链接
doc.moveDown(3);
const yEnd = doc.y;
doc.strokeColor(COLOR_LINE).lineWidth(0.5)
   .moveTo(MARGIN, yEnd).lineTo(PAGE.width - MARGIN, yEnd).stroke();
doc.moveDown(0.5);
doc.font('cn').fontSize(9).fillColor(COLOR_MUTED)
   .text('本项目所有截图取自线上真实部署版本 · 项目仓库与在线访问地址见第 1 页', { align: 'center' });

doc.end();
stream.on('finish', () => {
  const size = (fs.statSync(OUT).size / 1024).toFixed(1);
  console.log(`✅ PDF 生成完成: ${OUT} (${size} KB)`);
});
