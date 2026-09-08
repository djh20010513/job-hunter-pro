/* JobHunter Pro · 精选职位库(国内)
 * 每条职位都带可搜索的官方 URL 模板 + 关键词,点过去直接是该岗位的搜索结果页
 * 国内大厂招聘官网反爬严格,无法实时抓取,采取 "精选数据库 + 一键跳转搜索页" 策略
 */
window.JOB_SOURCES = []; // 国内 CORS 不友好,全部使用内置精选库 + 一键跳转官方搜索页

// 招聘官网 URL 模板 (keyword 已 URL 编码)
const URLS = {
  bytedance:  kw => `https://jobs.bytedance.com/position?keywords=${encodeURIComponent(kw)}`,
  tencent:    kw => `https://careers.tencent.com/search.html?keyword=${encodeURIComponent(kw)}`,
  alibaba:    kw => `https://talent.alibaba.com/off-campus/position-list?keyword=${encodeURIComponent(kw)}`,
  baidu:      kw => `https://talent.baidu.com/jobs/list?keyword=${encodeURIComponent(kw)}`,
  meituan:    kw => `https://zhaopin.meituan.com/web/position?hiringSource=0&keyword=${encodeURIComponent(kw)}`,
  jd:         kw => `https://zhaopin.jd.com/web/job/job_info_list/3?keyword=${encodeURIComponent(kw)}`,
  xhs:        kw => `https://job.xiaohongshu.com/jobs?keyword=${encodeURIComponent(kw)}`,
  kuaishou:   kw => `https://zhaopin.kuaishou.com/recruit/e/#/official/social?keyword=${encodeURIComponent(kw)}`,
  didi:       kw => `https://talent.didiglobal.com/position/index?keyword=${encodeURIComponent(kw)}`,
  pdd:        kw => `https://career.pinduoduo.com/jobs?keyword=${encodeURIComponent(kw)}`,
  netease:    kw => `https://hr.163.com/job-list.html?keyword=${encodeURIComponent(kw)}`,
  zhihu:      kw => `https://app.mokahr.com/apply/zhihu#/jobs?keyword=${encodeURIComponent(kw)}`,
  ant:        kw => `https://talent.antgroup.com/off-campus-campus-recruitment?keyword=${encodeURIComponent(kw)}`,
  huawei:     kw => `https://career.huawei.com/reccampportal/portal5/search.html?keyword=${encodeURIComponent(kw)}`,
  xiaomi:     kw => `https://hr.xiaomi.com/careers?keyword=${encodeURIComponent(kw)}`,
  moonshot:   kw => `https://www.moonshot.cn/jobs?keyword=${encodeURIComponent(kw)}`,
  zhipu:      kw => `https://www.zhipuai.cn/jobs?keyword=${encodeURIComponent(kw)}`,
  deepseek:   kw => `https://www.deepseek.com/?keyword=${encodeURIComponent(kw)}`,
  minimax:    kw => `https://www.MiniMax.cn/jobs?keyword=${encodeURIComponent(kw)}`,
  stepfun:    kw => `https://www.stepfun.com/jobs?keyword=${encodeURIComponent(kw)}`,
  baichuan:   kw => `https://www.baichuan-inc.com/jobs?keyword=${encodeURIComponent(kw)}`,
  lingyi:     kw => `https://www.lingyiwanwu.com/jobs?keyword=${encodeURIComponent(kw)}`,
  sensetime:  kw => `https://hr.sensetime.com/SU60a4f1b6dc9c0e7e2c1a5b5c2/pb/index.html?keyword=${encodeURIComponent(kw)}`,
  megvii:     kw => `https://app.mokahr.com/apply/megvii?keyword=${encodeURIComponent(kw)}`,
  cloudwalk:  kw => `https://www.cloudwalk.com/joinus?keyword=${encodeURIComponent(kw)}`,
  mobvoi:     kw => `https://www.chumenwenwen.com/jobs?keyword=${encodeURIComponent(kw)}`,
  innoways:   kw => `https://www.innovationworks.com/jobs?keyword=${encodeURIComponent(kw)}`,
  // 第三方招聘网站(国内) - 真实公开搜索
  boss:       kw => `https://www.zhipin.com/web/geek/job?query=${encodeURIComponent(kw)}`,
  lagou:      kw => `https://www.lagou.com/wn/jobs?kd=${encodeURIComponent(kw)}`,
  lietou:     kw => `https://www.liepin.com/zhaopin/?key=${encodeURIComponent(kw)}`
};

// ========== 完整 JD 文本生成器 ==========
// 基于真实 JD 通用结构,生成包含岗位职责/任职要求/加分项/福利的完整 JD
// 用户复制后可直接用于投递准备,也可去官网对照真实 JD
// 每个职位自动判断类型:
//   'social'        = 社招(默认)
//   'campus-grad'   = 校招 / 应届
//   'campus-intern' = 实习
window.detectJobType = function(role){
  const r = (role||'').toLowerCase();
  if(/实习|intern/.test(r)) return 'campus-intern';
  if(/应届|校招|毕业生|管培/.test(r)) return 'campus-grad';
  return 'social';
};

window.JOB_TYPE_LABEL = {
  'social':        '🧑‍💼 社招',
  'campus-grad':   '🎓 校招',
  'campus-intern': '📚 实习'
};

window.buildFullJD = function(job){
  const tags = (job.tags||[]).join('、');
  const role = job.role;
  const company = job.company;
  const city = job.city;
  const salary = job.salary;

  // 根据 category 生成对应职责
  let responsibilities = '', requirements = '', bonus = '';
  if(job.category === 'ai'){
    responsibilities = `1. 负责 ${role} 相关 AI 产品的全生命周期管理:需求挖掘、产品规划、PRD 撰写、上线跟进、数据复盘
2. 与算法团队紧密协作,推动大模型(LLM) / Agent / RAG 等 AI 能力在产品中落地
3. 跟踪 DAU / 留存 / 转化等核心指标,基于数据持续优化产品体验
4. 设计 AI 原生交互范式,推动 Prompt / Agent / 多模态等能力在 C/B 端产品中的应用
5. 关注国内外 AI 产品前沿趋势,定期输出竞品分析报告`;
    requirements = `1. 本科及以上学历,计算机 / AI / 产品 / 设计等相关专业优先
2. 2 年以上互联网产品经验,有 AI 产品(LLM / Agent / AIGC)经验者优先
3. 熟悉 LLM / RAG / Prompt 工程 / Agent / 向量数据库等技术原理,有 Coze / Dify / LangChain 使用经验
4. 优秀的产品 sense,逻辑清晰,数据敏感(熟练 SQL / Excel / Python 加分)
5. 良好的跨部门协作能力,能在算法、设计、研发间推动项目落地`;
    bonus = `加分项:
• 有从 0 到 1 的 AI 产品经验(如 Chatbot / 智能助手 / AIGC 工具)
• GitHub / 技术博客有 Prompt / Agent 相关开源项目
• 在 Hugging Face / 机器之心 / 36氪 等平台有 AI 产品分析文章
• B 端产品经验(API 设计 / 企业级 SaaS)`;
  } else if(job.category === 'product'){
    responsibilities = `1. 负责 ${role} 方向的产品规划与迭代,撰写 PRD 推动方案落地
2. 与研发、设计、算法团队协作,把控产品上线节奏与质量
3. 基于数据分析(用户行为、转化漏斗、留存曲线)持续优化产品体验
4. 跟踪行业竞品,定期输出竞品分析与产品策略报告
5. 跨部门协调资源,推动重大项目按期交付`;
    requirements = `1. 本科及以上学历,3 年以上互联网产品经验
2. 熟练使用 Axure / Figma / 墨刀 等原型工具,优秀的 PRD 撰写能力
3. 数据驱动,熟悉 SQL,能独立完成数据分析与洞察
4. 良好的用户调研能力,能深入用户场景挖掘真实需求
5. 有从 0 到 1 产品经验或大型项目主导经验者优先`;
    bonus = `加分项:
• 有 ${tags} 相关经验
• 技术背景(能看懂 SQL / API / 数据结构)
• 有成功的产品案例可分享
• 计算机 / 设计 / 心理学等相关专业`;
  } else if(job.category === 'tech'){
    responsibilities = `1. 参与 ${role} 相关核心系统的设计、开发与维护
2. 负责 Web / 移动端核心功能开发,保障系统稳定性与性能
3. 与产品、设计协作,完成需求到代码的完整落地
4. 关注前沿技术(AI / LLM / Web3D),推动技术创新应用
5. 编写技术文档,参与 Code Review,提升团队工程效率`;
    requirements = `1. 本科及以上学历,计算机相关专业,3 年以上开发经验
2. 精通至少一种主流语言(JavaScript / TypeScript / Python / Go / Java)
3. 熟悉 React / Vue / Node.js 等前端栈,或 Spring / Gin / Django 等后端栈
4. 良好的算法基础与系统设计能力
5. 有开源项目 / 技术博客 / 技术分享者优先`;
    bonus = `加分项:
• 有 LLM / Agent 应用开发经验
• 有大型分布式系统经验
• ACM / 算法竞赛获奖经历`;
  } else if(job.category === 'design'){
    responsibilities = `1. 负责 AI 产品 / C 端产品的视觉与交互设计
2. 与产品、研发协作完成从概念到上线的完整设计流程
3. 探索 AI 原生产品的设计范式,建立设计规范
4. 输出设计组件库,提升团队设计效率`;
    requirements = `1. 本科及以上学历,设计 / 美术相关专业,3 年以上设计经验
2. 精通 Figma / Sketch / Photoshop 等设计工具
3. 有完整的 C 端 / B 端产品设计案例
4. 良好的审美与设计表达能力`;
    bonus = `加分项:
• AIGC / AI 工具产品设计经验
• 有 Dribbble / Behance / 站酷 等作品集
• 动效 / 3D 设计能力`;
  } else {
    responsibilities = `1. 负责 ${role} 相关业务的产品规划与运营落地
2. 与产品、技术团队协作,推动功能上线与数据增长
3. 基于数据分析持续优化用户体验与转化指标`;
    requirements = `1. 本科及以上学历,2 年以上相关经验
2. 良好的协作能力与执行力
3. 数据敏感,能基于数据做决策`;
    bonus = `加分项:
• 互联网运营 / 增长经验
• 有成功案例可分享`;
  }

  return `${company} - ${role}

【公司介绍】
${company} 是中国领先的互联网科技公司,业务覆盖 ${tags || '多个核心领域'},在 ${city} 等地区设有研发中心。公司持续投入前沿技术(AI / 大模型 / 推荐系统),为用户与合作伙伴创造价值。

【薪资福利】
${salary} · ${city}
• 五险一金 / 补充医疗 / 商业保险
• 弹性工作制,Work-Life Balance
• 免费三餐 / 下午茶 / 健身房
• 年终奖 / 股票期权 / 晋升通道
• 技术培训 / 出国交流 / 学术会议支持

【岗位职责】
${responsibilities}

【任职要求】
${requirements}

${bonus}

【投递方式】
1. 官网投递:${job.url}
2. Boss 直聘搜索"${role}" / "${company}"
3. 拉勾网搜索"${role}" / "${company}"
4. 猎聘搜索"${role}" / "${company}"

注:本 JD 为标准模板,可作为投递准备参考。请以官方最新发布 JD 为准。`;
};

window.JOB_DATABASE = [
  // ============ 字节跳动 ============
  { id:'b-001', company:'字节跳动', role:'AI 产品经理', city:'北京/杭州', category:'ai', salary:'35-65K·16薪',
    tags:['AI Agent','LLM','B 端','产品设计'],
    desc:'负责抖音/豆包等核心 AI 产品的功能规划、PRD 撰写、跨部门协作,推动 AI 能力落地。',
    source:'字节招聘官网', url: URLS.bytedance('AI 产品经理') },

  { id:'b-002', company:'字节跳动', role:'高级产品经理 - 推荐算法', city:'北京', category:'product', salary:'40-70K·16薪',
    tags:['推荐系统','算法','策略产品'],
    desc:'负责抖音/TikTok 推荐系统产品方向,定义核心指标与策略,与算法团队深度协作。',
    source:'字节招聘官网', url: URLS.bytedance('推荐算法产品经理') },

  { id:'b-003', company:'字节跳动', role:'产品经理 - 抖音', city:'北京/上海', category:'product', salary:'30-55K·16薪',
    tags:['短视频','C 端','内容'],
    desc:'负责抖音核心产品方向,优化推荐与社交体验。',
    source:'字节招聘官网', url: URLS.bytedance('抖音产品经理') },

  { id:'b-004', company:'字节跳动', role:'产品经理 - 飞书', city:'北京/深圳', category:'product', salary:'30-55K·16薪',
    tags:['B 端','SaaS','协同办公'],
    desc:'负责飞书产品方向,推动 AI 协同与办公场景应用。',
    source:'字节招聘官网', url: URLS.bytedance('飞书产品经理') },

  { id:'b-005', company:'字节跳动', role:'前端工程师 - AI 方向', city:'杭州', category:'tech', salary:'30-55K·16薪',
    tags:['React','LLM','AI 应用'],
    desc:'参与豆包 / Coze 等 AI 产品的 Web 端研发,设计 AI 交互体验。',
    source:'字节招聘官网', url: URLS.bytedance('前端 AI') },

  // ============ 腾讯 ============
  { id:'t-001', company:'腾讯', role:'AI 产品经理 (混元)', city:'深圳', category:'ai', salary:'30-55K·14薪',
    tags:['大模型','B 端','腾讯混元'],
    desc:'负责腾讯混元大模型的对外产品规划,推动 AI 能力在微信/QQ 等场景落地。',
    source:'腾讯招聘官网', url: URLS.tencent('AI 产品经理') },

  { id:'t-002', company:'腾讯', role:'产品经理 - 微信视频号', city:'深圳', category:'product', salary:'30-50K·14薪',
    tags:['短视频','C 端','策略'],
    desc:'负责视频号产品方向,定义创作者生态、推荐策略与商业化路径。',
    source:'腾讯招聘官网', url: URLS.tencent('视频号产品经理') },

  { id:'t-003', company:'腾讯', role:'产品经理 - QQ', city:'深圳', category:'product', salary:'25-45K·14薪',
    tags:['社交','C 端','年轻化'],
    desc:'负责 QQ 产品方向,推进年轻化与 AI 化改造。',
    source:'腾讯招聘官网', url: URLS.tencent('QQ 产品经理') },

  { id:'t-004', company:'腾讯', role:'产品经理 - 腾讯文档', city:'深圳/北京', category:'product', salary:'25-45K·14薪',
    tags:['B 端','SaaS','协同'],
    desc:'负责腾讯文档 AI 化产品方向,推动 AI 助理在协同办公场景落地。',
    source:'腾讯招聘官网', url: URLS.tencent('腾讯文档产品经理') },

  // ============ 阿里巴巴 ============
  { id:'a-001', company:'阿里巴巴', role:'AI 产品经理 (通义)', city:'杭州/北京', category:'ai', salary:'30-60K·16薪',
    tags:['通义千问','B 端','AI 应用'],
    desc:'负责通义千问 / 钉钉 AI 应用产品规划,推动 AI 能力在阿里云、淘宝、钉钉等场景落地。',
    source:'阿里招聘官网', url: URLS.alibaba('AI 产品经理') },

  { id:'a-002', company:'阿里巴巴', role:'产品经理 - 淘宝', city:'杭州', category:'product', salary:'30-50K·16薪',
    tags:['电商','C 端','商业化'],
    desc:'负责淘宝核心交易链路产品设计,优化买家体验与商家工具。',
    source:'阿里招聘官网', url: URLS.alibaba('淘宝产品经理') },

  { id:'a-003', company:'阿里巴巴', role:'产品经理 - 钉钉', city:'杭州', category:'product', salary:'25-50K·16薪',
    tags:['B 端','SaaS','协同'],
    desc:'负责钉钉 AI 化产品方向,推动 AI 助理 / 智能协同场景落地。',
    source:'阿里招聘官网', url: URLS.alibaba('钉钉产品经理') },

  { id:'a-004', company:'阿里巴巴', role:'产品经理 - 闲鱼', city:'杭州', category:'product', salary:'25-45K·16薪',
    tags:['C 端','二手交易','社区'],
    desc:'负责闲鱼产品方向,优化二手交易与社区体验。',
    source:'阿里招聘官网', url: URLS.alibaba('闲鱼产品经理') },

  // ============ 百度 ============
  { id:'bd-001', company:'百度', role:'AI 产品经理 (文心)', city:'北京', category:'ai', salary:'30-55K·16薪',
    tags:['文心一言','大模型','B 端'],
    desc:'负责文心一言大模型产品方向,与 ERNIE 团队协作打造 AI 原生应用。',
    source:'百度招聘官网', url: URLS.baidu('AI 产品经理') },

  { id:'bd-002', company:'百度', role:'自动驾驶产品经理', city:'北京/上海', category:'product', salary:'35-60K·16薪',
    tags:['Apollo','自动驾驶','策略'],
    desc:'负责 Apollo 无人车 / 萝卜快跑产品方向,定义运营与用户体验策略。',
    source:'百度招聘官网', url: URLS.baidu('自动驾驶产品经理') },

  // ============ 美团 ============
  { id:'mt-001', company:'美团', role:'AI 产品经理', city:'北京', category:'ai', salary:'30-55K·15.5薪',
    tags:['本地生活','LLM','B 端'],
    desc:'负责美团 AI 助手 / 智能客服等产品方向,推动 AI 能力在本地生活场景落地。',
    source:'美团招聘官网', url: URLS.meituan('AI 产品经理') },

  { id:'mt-002', company:'美团', role:'产品经理 - 闪购', city:'北京/上海', category:'product', salary:'25-45K·15.5薪',
    tags:['即时零售','C 端'],
    desc:'负责美团闪购产品方向,优化用户即时零售体验。',
    source:'美团招聘官网', url: URLS.meituan('闪购产品经理') },

  // ============ 京东 ============
  { id:'jd-001', company:'京东', role:'AI 产品经理 (言犀)', city:'北京', category:'ai', salary:'30-55K·16薪',
    tags:['言犀大模型','B 端','电商 AI'],
    desc:'负责京东言犀大模型对外产品,推动 AI 在电商客服、零售场景应用。',
    source:'京东招聘官网', url: URLS.jd('AI 产品经理') },

  { id:'jd-002', company:'京东', role:'产品经理 - 京东 App', city:'北京', category:'product', salary:'25-45K·16薪',
    tags:['电商','C 端'],
    desc:'负责京东 App 核心链路产品优化,提升转化与留存。',
    source:'京东招聘官网', url: URLS.jd('京东产品经理') },

  // ============ 小红书 ============
  { id:'xhs-001', company:'小红书', role:'AI 产品经理', city:'上海/北京', category:'ai', salary:'30-55K·15薪',
    tags:['AIGC','内容','AI 工具'],
    desc:'负责小红书 AI 搜索 / AIGC 创作工具等产品方向,服务内容创作者。',
    source:'小红书招聘官网', url: URLS.xhs('AI 产品经理') },

  { id:'xhs-002', company:'小红书', role:'产品经理 - 增长', city:'上海', category:'product', salary:'25-45K·15薪',
    tags:['增长','用户增长','策略'],
    desc:'负责小红书用户增长方向,设计拉新、留存、转化策略。',
    source:'小红书招聘官网', url: URLS.xhs('增长产品经理') },

  // ============ 快手 ============
  { id:'ks-001', company:'快手', role:'AI 产品经理 (可灵)', city:'北京/杭州', category:'ai', salary:'30-55K·16薪',
    tags:['可灵 AI','视频生成','AIGC'],
    desc:'负责可灵 AI 视频生成产品方向,定义创作工具与商业化路径。',
    source:'快手招聘官网', url: URLS.kuaishou('AI 产品经理') },

  { id:'ks-002', company:'快手', role:'产品经理 - 主站', city:'北京', category:'product', salary:'25-45K·16薪',
    tags:['短视频','C 端'],
    desc:'负责快手主站产品方向,优化推荐、关注与发现页体验。',
    source:'快手招聘官网', url: URLS.kuaishou('产品经理') },

  // ============ 滴滴 ============
  { id:'dd-001', company:'滴滴', role:'AI 产品经理', city:'北京', category:'ai', salary:'30-50K·15薪',
    tags:['出行','LLM','B 端'],
    desc:'负责滴滴 AI 客服 / 智能调度等产品方向,推动 AI 在出行场景落地。',
    source:'滴滴招聘官网', url: URLS.didi('AI 产品经理') },

  // ============ 拼多多 ============
  { id:'pdd-001', company:'拼多多', role:'AI 产品经理', city:'上海', category:'ai', salary:'30-55K·16薪',
    tags:['大模型','电商 AI'],
    desc:'负责多多 AI 助手等产品方向,推动 AI 在电商全链路落地。',
    source:'拼多多招聘官网', url: URLS.pdd('AI 产品经理') },

  { id:'pdd-002', company:'拼多多', role:'产品经理 - 推荐', city:'上海', category:'product', salary:'30-55K·16薪',
    tags:['推荐','电商','策略'],
    desc:'负责拼多多推荐系统产品方向,与算法团队深度协作。',
    source:'拼多多招聘官网', url: URLS.pdd('推荐产品经理') },

  // ============ 网易 ============
  { id:'ne-001', company:'网易', role:'AI 产品经理 (有道)', city:'杭州/北京', category:'ai', salary:'25-45K·15薪',
    tags:['教育 AI','LLM','B 端'],
    desc:'负责网易有道 AI 教育产品方向,推动 AI 在语言学习场景应用。',
    source:'网易招聘官网', url: URLS.netease('AI 产品经理') },

  // ============ 知乎 ============
  { id:'zh-001', company:'知乎', role:'AI 产品经理 (知海图)', city:'北京', category:'ai', salary:'25-50K·14薪',
    tags:['AIGC','内容','LLM'],
    desc:'负责知乎 AI 搜索 / 知海图大模型产品方向,服务创作者与读者。',
    source:'知乎招聘官网', url: URLS.zhihu('AI 产品经理') },

  // ============ 蚂蚁集团 ============
  { id:'ant-001', company:'蚂蚁集团', role:'AI 产品经理', city:'杭州/上海', category:'ai', salary:'30-55K·16薪',
    tags:['金融 AI','B 端','大模型'],
    desc:'负责蚂蚁金融 AI 产品方向,推动大模型在支付、信贷、风控场景落地。',
    source:'蚂蚁招聘官网', url: URLS.ant('AI 产品经理') },

  // ============ 华为 ============
  { id:'hw-001', company:'华为', role:'AI 产品经理 (盘古)', city:'深圳/北京', category:'ai', salary:'30-55K·14薪',
    tags:['盘古大模型','B 端','昇腾'],
    desc:'负责华为盘古大模型产品方向,推动 AI 在政企、终端场景落地。',
    source:'华为招聘官网', url: URLS.huawei('AI 产品经理') },

  // ============ 小米 ============
  { id:'mi-001', company:'小米', role:'AI 产品经理', city:'北京', category:'ai', salary:'30-50K·14薪',
    tags:['小爱同学','IoT','AI 应用'],
    desc:'负责小米小爱同学 / AIoT 产品方向,推动 AI 在智能硬件场景应用。',
    source:'小米招聘官网', url: URLS.xiaomi('AI 产品经理') },

  // ============ AI 创业公司 ============
  { id:'yh-001', company:'月之暗面 (Kimi)', role:'AI 产品经理', city:'北京', category:'ai', salary:'30-60K·15薪',
    tags:['大模型','C 端','AI 搜索'],
    desc:'负责 Kimi 智能助手产品规划,推动大模型在 C 端 AI 搜索场景应用。',
    source:'月之暗面招聘', url: URLS.moonshot('AI 产品经理') },

  { id:'zj-001', company:'智谱 AI', role:'AI 产品经理', city:'北京', category:'ai', salary:'30-55K·15薪',
    tags:['GLM','B 端','大模型'],
    desc:'负责智谱清言 / GLM 大模型产品方向,推动 B 端 AI 应用落地。',
    source:'智谱招聘', url: URLS.zhipu('AI 产品经理') },

  { id:'ds-001', company:'DeepSeek', role:'AI 产品经理', city:'杭州', category:'ai', salary:'30-60K·15薪',
    tags:['大模型','B 端','AI 工具'],
    desc:'负责 DeepSeek 大模型产品规划与生态建设。',
    source:'DeepSeek招聘', url: URLS.deepseek('AI 产品经理') },

  { id:'yh-002', company:'MiniMax', role:'AI 产品经理', city:'上海', category:'ai', salary:'30-55K·15薪',
    tags:['大模型','C 端','AI 助手'],
    desc:'负责 MiniMax 大模型产品方向,推动 AI 助手 / 海螺 AI 等 C 端产品规划。',
    source:'MiniMax招聘', url: URLS.minimax('AI 产品经理') },

  { id:'yh-003', company:'阶跃星辰', role:'AI 产品经理', city:'上海/北京', category:'ai', salary:'30-60K·15薪',
    tags:['大模型','C 端','AI 助手'],
    desc:'负责阶跃星辰大模型产品方向,推动 AI 应用产品规划与落地。',
    source:'阶跃星辰招聘', url: URLS.stepfun('AI 产品经理') },

  { id:'yh-004', company:'百川智能', role:'AI 产品经理', city:'北京', category:'ai', salary:'30-55K·15薪',
    tags:['大模型','B 端','医疗 AI'],
    desc:'负责百川大模型产品方向,推动 AI 在医疗、教育的应用。',
    source:'百川智能招聘', url: URLS.baichuan('AI 产品经理') },

  { id:'yh-005', company:'零一万物', role:'AI 产品经理', city:'北京/深圳', category:'ai', salary:'30-60K·15薪',
    tags:['大模型','C 端','AI 应用'],
    desc:'负责零一万物大模型产品方向,推动 AI 原生应用产品规划。',
    source:'零一万物招聘', url: URLS.lingyi('AI 产品经理') },

  { id:'yh-006', company:'商汤科技', role:'AI 产品经理', city:'上海/北京', category:'ai', salary:'30-55K·14薪',
    tags:['CV','B 端','大模型'],
    desc:'负责商汤日日新大模型产品方向,推动 AI 在金融、安防场景落地。',
    source:'商汤招聘', url: URLS.sensetime('AI 产品经理') },

  { id:'yh-007', company:'旷视科技', role:'AI 产品经理', city:'北京', category:'ai', salary:'30-55K·14薪',
    tags:['CV','B 端','物联网'],
    desc:'负责旷视 AI 产品方向,推动视觉 AI 在物流、零售场景落地。',
    source:'旷视招聘', url: URLS.megvii('AI 产品经理') },

  { id:'yh-008', company:'云从科技', role:'AI 产品经理', city:'广州/上海', category:'ai', salary:'25-50K·14薪',
    tags:['CV','B 端','金融 AI'],
    desc:'负责云从 AI 产品方向,推动视觉 AI 在金融、政务场景落地。',
    source:'云从招聘', url: URLS.cloudwalk('AI 产品经理') },

  { id:'yh-009', company:'出门问问', role:'AI 产品经理', city:'北京/上海', category:'ai', salary:'25-45K·14薪',
    tags:['AIGC','C 端','语音'],
    desc:'负责出门问问 AIGC 产品方向,推动 AI 配音 / 数字人产品规划。',
    source:'出门问问招聘', url: URLS.mobvoi('AI 产品经理') },

  { id:'yh-010', company:'创新工场 (AI 创业)', role:'AI 产品经理', city:'北京', category:'ai', salary:'25-50K·14薪',
    tags:['AI 创业','早期','B/C 端'],
    desc:'负责 AI 创业项目产品规划,推动从 0 到 1 的产品设计与落地。',
    source:'创新工场招聘', url: URLS.innoways('AI 产品经理') },

  // ============ 中厂(中型互联网/科技公司) ============
  { id:'mid-001', company:'B 站 (哔哩哔哩)', role:'AI 产品经理', city:'上海', category:'ai', salary:'25-50K·15薪',
    tags:['AIGC','内容社区','B 端'], desc:'负责 B 站 AI 创作工具 / AIGC 产品方向,服务 UP 主与创作者。',
    source:'B站招聘', url:'https://jobs.bilibili.com/positions?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-002', company:'B 站 (哔哩哔哩)', role:'产品经理 - 增长', city:'上海', category:'product', salary:'25-45K·15薪',
    tags:['增长','社区','C 端'], desc:'负责 B 站用户增长方向,设计 DAU / 留存 / 转化策略。',
    source:'B站招聘', url:'https://jobs.bilibili.com/positions?keyword=' + encodeURIComponent('增长产品经理') },

  { id:'mid-003', company:'B 站 (哔哩哔哩)', role:'产品经理实习', city:'上海', category:'product', salary:'300-400/天',
    tags:['实习','C 端','内容'], desc:'参与 B 站主站产品方向,跟进核心功能迭代与数据分析。',
    source:'B站校招', url:'https://jobs.bilibili.com/campus/positions?keyword=' + encodeURIComponent('产品经理实习') },

  { id:'mid-004', company:'知乎', role:'产品经理 - 商业化', city:'北京', category:'product', salary:'25-45K·14薪',
    tags:['商业化','广告','C 端'], desc:'负责知乎商业化产品方向,优化广告与会员体系。',
    source:'知乎招聘', url: URLS.zhihu('商业化产品经理') },

  { id:'mid-005', company:'知乎', role:'产品经理实习', city:'北京', category:'product', salary:'300-400/天',
    tags:['实习','C 端','社区'], desc:'参与知乎产品迭代与数据分析,负责具体功能模块设计。',
    source:'知乎校招', url: URLS.zhihu('产品实习') },

  { id:'mid-006', company:'陌陌', role:'AI 产品经理', city:'北京', category:'ai', salary:'25-45K·14薪',
    tags:['社交','LLM','C 端'], desc:'负责陌陌 AI 社交助手产品方向,推动 AI 在社交场景落地。',
    source:'陌陌招聘', url:'https://mm.immomo.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-007', company:'探探', role:'产品经理 - 匹配算法', city:'北京', category:'product', salary:'25-45K·14薪',
    tags:['社交','推荐','C 端'], desc:'负责探探匹配推荐系统产品方向,与算法团队深度协作。',
    source:'探探招聘', url:'https://tantanapp.com/jobs?keyword=' + encodeURIComponent('产品经理') },

  { id:'mid-008', company:'虎牙', role:'AI 产品经理', city:'广州', category:'ai', salary:'20-40K·13薪',
    tags:['直播','AIGC','C 端'], desc:'负责虎牙 AIGC 直播产品方向,推动 AI 数字人 / 智能直播应用。',
    source:'虎牙招聘', url:'https://hr.huya.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-009', company:'斗鱼', role:'产品经理', city:'武汉', category:'product', salary:'20-35K·13薪',
    tags:['直播','C 端'], desc:'负责斗鱼产品方向,优化直播体验与社区互动。',
    source:'斗鱼招聘', url:'https://www.douyu.com/recruit?keyword=' + encodeURIComponent('产品经理') },

  { id:'mid-010', company:'酷狗音乐 / 腾讯音乐', role:'AI 产品经理', city:'广州', category:'ai', salary:'25-50K·14薪',
    tags:['音乐','LLM','C 端'], desc:'负责腾讯音乐 AI 产品方向,推动 AI 在音乐场景应用。',
    source:'腾讯音乐招聘', url:'https://join.tencentmusic.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-011', company:'网易云音乐', role:'AI 产品经理', city:'杭州', category:'ai', salary:'25-45K·15薪',
    tags:['音乐','AIGC','推荐'], desc:'负责网易云音乐 AI 推荐 / AIGC 产品方向。',
    source:'网易云音乐招聘', url:'https://hr.music.163.com/position/list?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-012', company:'爱奇艺', role:'AI 产品经理', city:'北京', category:'ai', salary:'25-45K·14薪',
    tags:['长视频','AIGC','内容'], desc:'负责爱奇艺 AIGC 视频创作工具产品方向。',
    source:'爱奇艺招聘', url:'https://hr.iqiyi.com/job.html?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-013', company:'优酷 / 阿里大文娱', role:'产品经理', city:'北京/杭州', category:'product', salary:'25-45K·15薪',
    tags:['长视频','C 端','内容'], desc:'负责优酷产品方向,优化用户体验与商业化路径。',
    source:'阿里大文娱招聘', url: URLS.alibaba('优酷产品经理') },

  { id:'mid-014', company:'马蜂窝', role:'AI 产品经理', city:'北京', category:'ai', salary:'20-40K·13薪',
    tags:['旅游','LLM','C 端'], desc:'负责马蜂窝 AI 旅行助手产品方向。',
    source:'马蜂窝招聘', url:'https://hr.mafengwo.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-015', company:'携程', role:'AI 产品经理', city:'上海', category:'ai', salary:'25-50K·14薪',
    tags:['旅游','LLM','B 端'], desc:'负责携程 AI 旅行助手 / 智能客服产品方向。',
    source:'携程招聘', url:'https://hr.ctrip.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-016', company:'去哪儿', role:'产品经理 - AI', city:'北京', category:'ai', salary:'25-45K·14薪',
    tags:['旅游','LLM','C 端'], desc:'负责去哪儿 AI 产品方向,提升用户出行效率。',
    source:'去哪儿招聘', url:'https://hr.qunar.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-017', company:'贝壳找房', role:'AI 产品经理', city:'北京', category:'ai', salary:'25-50K·15薪',
    tags:['房产','LLM','B 端'], desc:'负责贝壳 AI 经纪人助手 / 智能客服产品方向。',
    source:'贝壳招聘', url:'https://hr.ke.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-018', company:'链家', role:'产品经理', city:'北京', category:'product', salary:'20-40K·14薪',
    tags:['房产','C 端'], desc:'负责链家产品方向,优化房产交易体验。',
    source:'链家招聘', url:'https://hr.lianjia.com/jobs?keyword=' + encodeURIComponent('产品经理') },

  { id:'mid-019', company:'得物', role:'AI 产品经理', city:'上海', category:'ai', salary:'25-50K·15薪',
    tags:['电商','潮流','LLM'], desc:'负责得物 AI 商品识别 / 智能推荐产品方向。',
    source:'得物招聘', url:'https://hr.dewu.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-020', company:'什么值得买', role:'产品经理 - AI', city:'北京', category:'ai', salary:'20-40K·13薪',
    tags:['电商','推荐','LLM'], desc:'负责什么值得买 AI 推荐产品方向。',
    source:'值得买招聘', url:'https://hr.smzdm.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-021', company:'Keep', role:'AI 产品经理', city:'北京', category:'ai', salary:'25-45K·14薪',
    tags:['健身','AIGC','C 端'], desc:'负责 Keep AI 健身教练 / AIGC 内容产品方向。',
    source:'Keep招聘', url:'https://hr.keep.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-022', company:'Soul', role:'AI 产品经理', city:'上海', category:'ai', salary:'25-45K·15薪',
    tags:['社交','AIGC','C 端'], desc:'负责 Soul AI 社交产品方向,推动 AI 陪伴 / 数字人场景。',
    source:'Soul招聘', url:'https://hr.soulapp.cn/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-023', company:'米哈游', role:'AI 产品经理', city:'上海', category:'ai', salary:'30-60K·16薪',
    tags:['游戏','AIGC','B 端'], desc:'负责米哈游 AIGC 游戏资产生成产品方向。',
    source:'米哈游招聘', url:'https://jobs.mihoyo.com/?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-024', company:'莉莉丝游戏', role:'产品经理', city:'上海', category:'product', salary:'25-50K·15薪',
    tags:['游戏','策略','C 端'], desc:'负责莉莉丝游戏产品方向,负责具体游戏功能设计。',
    source:'莉莉丝招聘', url:'https://lilith.games/jobs?keyword=' + encodeURIComponent('产品经理') },

  { id:'mid-025', company:'三七互娱', role:'AI 产品经理', city:'广州', category:'ai', salary:'25-45K·14薪',
    tags:['游戏','AIGC','B 端'], desc:'负责三七互娱 AIGC 内容生产工具产品方向。',
    source:'三七招聘', url:'https://zhaopin.37.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'mid-026', company:'完美世界', role:'产品经理', city:'北京', category:'product', salary:'20-40K·14薪',
    tags:['游戏','C 端'], desc:'负责完美世界游戏产品方向。',
    source:'完美世界招聘', url:'https://hr.wanmei.com/jobs?keyword=' + encodeURIComponent('产品经理') },

  // ============ 小厂/初创/垂直领域 ============
  { id:'sm-001', company:'飞书 (字节系)', role:'产品经理', city:'北京/深圳', category:'product', salary:'30-55K·16薪',
    tags:['B 端','SaaS','协同'], desc:'负责飞书 AI 协同产品方向,推动 AI 助理在企业场景落地。',
    source:'字节招聘', url: URLS.bytedance('飞书产品经理') },

  { id:'sm-002', company:'企微 (腾讯系)', role:'B 端产品经理', city:'深圳', category:'product', salary:'25-50K·14薪',
    tags:['B 端','SaaS','企业 IM'], desc:'负责企业微信 AI 产品方向,推动 AI 助理在企业协同场景。',
    source:'腾讯招聘', url: URLS.tencent('企业微信产品经理') },

  { id:'sm-003', company:'石墨文档', role:'AI 产品经理', city:'北京', category:'ai', salary:'20-40K·14薪',
    tags:['B 端','协同','LLM'], desc:'负责石墨文档 AI 助理产品方向,服务企业知识管理场景。',
    source:'石墨招聘', url:'https://shimo.im/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-004', company:'Notion 中国版 / FlowUs', role:'AI 产品经理', city:'上海/北京', category:'ai', salary:'25-45K·14薪',
    tags:['B 端','笔记','LLM'], desc:'负责 FlowUs AI 笔记产品方向。',
    source:'FlowUs招聘', url:'https://flowus.cn/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-005', company:'语雀 (蚂蚁系)', role:'AI 产品经理', city:'杭州', category:'ai', salary:'25-45K·16薪',
    tags:['B 端','知识管理','LLM'], desc:'负责语雀 AI 产品方向,推动 AI 在知识管理场景。',
    source:'蚂蚁招聘', url: URLS.ant('语雀产品经理') },

  { id:'sm-006', company:'钉钉 (阿里系)', role:'AI 产品经理', city:'杭州', category:'ai', salary:'30-55K·16薪',
    tags:['B 端','SaaS','LLM'], desc:'负责钉钉 AI 助理产品方向,推动 AI 在企业协同场景落地。',
    source:'阿里招聘', url: URLS.alibaba('钉钉 AI') },

  { id:'sm-007', company:'美图', role:'AI 产品经理', city:'厦门', category:'ai', salary:'25-50K·15薪',
    tags:['影像','AIGC','C 端'], desc:'负责美图 AI 影像产品方向,推动 AI 在修图 / 视频生成场景。',
    source:'美图招聘', url:'https://hr.meitu.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-008', company:'WPS / 金山办公', role:'AI 产品经理', city:'珠海/北京', category:'ai', salary:'25-50K·15薪',
    tags:['B 端','办公','LLM'], desc:'负责 WPS AI 办公助手产品方向。',
    source:'金山招聘', url:'https://hr.wps.cn/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-009', company:'飞书多维表格 / 简道云', role:'AI 产品经理', city:'杭州', category:'ai', salary:'20-40K·14薪',
    tags:['B 端','SaaS','零代码'], desc:'负责简道云 AI 产品方向,推动 AI 在企业应用搭建场景。',
    source:'简道云招聘', url:'https://jiandaoyun.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-010', company:'影石 Insta360', role:'AI 产品经理', city:'深圳', category:'ai', salary:'25-50K·15薪',
    tags:['硬件','影像','AI'], desc:'负责影石 AI 影像产品方向,推动 AI 在全景相机场景。',
    source:'影石招聘', url:'https://insta360.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-011', company:'大疆 DJI', role:'AI 产品经理', city:'深圳', category:'ai', salary:'30-55K·15薪',
    tags:['硬件','无人机','AI'], desc:'负责大疆 AI 影像 / 飞行产品方向。',
    source:'大疆招聘', url:'https://we.dji.com/zh-CN/social?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-012', company:'追觅', role:'AI 产品经理', city:'苏州/上海', category:'ai', salary:'25-50K·14薪',
    tags:['智能硬件','家电','AI'], desc:'负责追觅 AI 家电产品方向,推动 AI 在扫地机 / 家电场景。',
    source:'追觅招聘', url:'https://www.dreame.tech/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-013', company:'石头科技', role:'AI 产品经理', city:'北京', category:'ai', salary:'25-50K·15薪',
    tags:['智能硬件','家电','AI'], desc:'负责石头 AI 扫地机产品方向。',
    source:'石头招聘', url:'https://www.roborock.com/careers?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-014', company:'蔚来 / 小鹏 / 理想', role:'AI 产品经理', city:'上海/广州/北京', category:'ai', salary:'30-60K·15薪',
    tags:['智能汽车','座舱','AI'], desc:'负责新势力车企 AI 座舱 / 智能驾驶产品方向。',
    source:'蔚来招聘', url:'https://www.nio.com/nio-careers?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-015', company:'比亚迪', role:'AI 产品经理', city:'深圳', category:'ai', salary:'25-50K·14薪',
    tags:['汽车','座舱','AI'], desc:'负责比亚迪 AI 座舱产品方向。',
    source:'比亚迪招聘', url:'https://job.byd.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-016', company:'理想汽车', role:'AI 产品经理 - 座舱', city:'北京', category:'ai', salary:'30-60K·15薪',
    tags:['智能汽车','座舱','LLM'], desc:'负责理想汽车 AI 座舱助手产品方向。',
    source:'理想招聘', url:'https://www.lixiang.com/recruit?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'sm-017', company:'小鹏汽车', role:'产品经理 - 智驾', city:'广州', category:'product', salary:'25-50K·14薪',
    tags:['智驾','汽车'], desc:'负责小鹏智驾产品方向,定义自动驾驶用户体验。',
    source:'小鹏招聘', url:'https://www.xiaopeng.com/recruit.html?keyword=' + encodeURIComponent('产品经理') },

  // ============ AI 创业公司(早期/天使/B轮) ============
  { id:'ai-001', company:'Moonshot AI (月之暗面)', role:'AI 产品经理 - Kimi', city:'北京', category:'ai', salary:'30-70K·15薪',
    tags:['大模型','C 端','AI 搜索'], desc:'负责 Kimi 智能助手产品规划,推动 AI 在长上下文场景应用。',
    source:'月之暗面招聘', url: URLS.moonshot('AI 产品经理') },

  { id:'ai-002', company:'Zhipu AI (智谱)', role:'AI 产品经理 - GLM', city:'北京', category:'ai', salary:'30-60K·15薪',
    tags:['GLM','B 端','API'], desc:'负责智谱 GLM API 产品方向,服务企业 AI 应用集成。',
    source:'智谱招聘', url: URLS.zhipu('AI 产品经理') },

  { id:'ai-003', company:'DeepSeek', role:'AI 产品经理', city:'杭州', category:'ai', salary:'30-70K·15薪',
    tags:['大模型','API','B 端'], desc:'负责 DeepSeek 大模型 API 产品方向。',
    source:'DeepSeek招聘', url: URLS.deepseek('产品经理') },

  { id:'ai-004', company:'MiniMax', role:'AI 产品经理 - 海螺 AI', city:'上海', category:'ai', salary:'30-60K·15薪',
    tags:['大模型','C 端','AI 视频'], desc:'负责海螺 AI 视频生成产品方向。',
    source:'MiniMax招聘', url: URLS.minimax('AI 产品经理') },

  { id:'ai-005', company:'Stepfun (阶跃星辰)', role:'AI 产品经理', city:'上海', category:'ai', salary:'30-60K·15薪',
    tags:['大模型','C 端','多模态'], desc:'负责阶跃星辰多模态大模型产品方向。',
    source:'阶跃招聘', url: URLS.stepfun('产品经理') },

  { id:'ai-006', company:'Baichuan (百川智能)', role:'AI 产品经理 - 医疗', city:'北京', category:'ai', salary:'30-60K·15薪',
    tags:['大模型','医疗 AI','B 端'], desc:'负责百川医疗大模型产品方向。',
    source:'百川招聘', url: URLS.baichuan('AI 产品经理') },

  { id:'ai-007', company:'01.AI (零一万物)', role:'AI 产品经理', city:'北京', category:'ai', salary:'30-60K·15薪',
    tags:['大模型','C 端','AI 应用'], desc:'负责零一万物大模型 C 端应用产品方向。',
    source:'零一万物招聘', url: URLS.lingyi('产品经理') },

  { id:'ai-008', company:'MiniMax 稀宇科技', role:'AI 产品实习', city:'上海/北京', category:'ai', salary:'400-600/天',
    tags:['实习','大模型','C 端'], desc:'参与 MiniMax C 端大模型产品设计与迭代。',
    source:'MiniMax校招', url: URLS.minimax('产品实习') },

  { id:'ai-009', company:'面壁智能', role:'AI 产品经理', city:'北京', category:'ai', salary:'25-50K·14薪',
    tags:['大模型','B 端','端侧'], desc:'负责面壁智能 MiniCPM 端侧大模型产品方向。',
    source:'面壁招聘', url:'https://www.modelbest.cn/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'ai-010', company:'生数科技 (Vidu)', role:'AI 产品经理 - 视频', city:'北京', category:'ai', salary:'30-60K·15薪',
    tags:['视频生成','AIGC','多模态'], desc:'负责 Vidu 视频生成产品方向。',
    source:'生数招聘', url:'https://www.shengshu.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'ai-011', company:'光年之外 (美团系)', role:'AI 产品经理', city:'北京', category:'ai', salary:'30-60K·15薪',
    tags:['大模型','AI 应用'], desc:'负责光年之外大模型产品方向。',
    source:'光年招聘', url:'https://www.guangnianzhihui.com/jobs?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'ai-012', company:'Pika 中国 / AI 视频创业', role:'AI 产品经理', city:'北京', category:'ai', salary:'30-60K·15薪',
    tags:['视频生成','AIGC'], desc:'负责 AI 视频生成产品方向。',
    source:'AI 创业', url:'https://www.pika.art/careers?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'ai-013', company:'HeyGen 中国版 / 数字人', role:'AI 产品经理 - 数字人', city:'北京/深圳', category:'ai', salary:'25-50K·14薪',
    tags:['数字人','AIGC','B 端'], desc:'负责数字人产品方向,推动 AI 在直播 / 营销场景。',
    source:'数字人招聘', url:'https://www.synthesia.io/careers?keyword=' + encodeURIComponent('AI 产品经理') },

  { id:'ai-014', company:'ElevenLabs 中国 / 语音 AI', role:'AI 产品经理 - 语音', city:'北京/上海', category:'ai', salary:'25-50K·14薪',
    tags:['语音 AI','AIGC','B 端'], desc:'负责语音 AI 产品方向。',
    source:'语音 AI', url:'https://elevenlabs.io/careers?keyword=' + encodeURIComponent('AI 产品经理') },

  // ============ 校招/实习岗 (应届) ============
  { id:'cp-001', company:'字节跳动', role:'AI 产品经理实习', city:'北京/杭州', category:'ai', salary:'400-600/天',
    tags:['实习','大模型','B 端'], desc:'参与字节 AI 产品方向实习,跟进产品迭代与数据分析。',
    source:'字节校招', url: URLS.bytedance('AI 产品实习') },

  { id:'cp-002', company:'腾讯', role:'产品经理实习 (微信)', city:'深圳', category:'product', salary:'300-500/天',
    tags:['实习','C 端','微信'], desc:'参与微信产品方向实习,跟进具体功能模块设计。',
    source:'腾讯校招', url: URLS.tencent('产品实习') },

  { id:'cp-003', company:'阿里巴巴', role:'产品经理实习 (淘宝)', city:'杭州', category:'product', salary:'300-500/天',
    tags:['实习','电商','C 端'], desc:'参与淘宝产品方向实习。',
    source:'阿里校招', url: URLS.alibaba('产品实习') },

  { id:'cp-004', company:'百度', role:'产品经理实习', city:'北京', category:'product', salary:'300-500/天',
    tags:['实习','AI','搜索'], desc:'参与百度搜索 / 文心一言产品方向实习。',
    source:'百度校招', url: URLS.baidu('产品实习') },

  { id:'cp-005', company:'美团', role:'产品经理实习', city:'北京', category:'product', salary:'300-500/天',
    tags:['实习','本地生活','C 端'], desc:'参与美团产品方向实习。',
    source:'美团校招', url: URLS.meituan('产品实习') },

  { id:'cp-006', company:'小红书', role:'产品经理实习', city:'上海/北京', category:'product', salary:'350-500/天',
    tags:['实习','内容','社区'], desc:'参与小红书产品方向实习。',
    source:'小红书校招', url: URLS.xhs('产品实习') },

  { id:'cp-007', company:'快手', role:'产品经理实习 (可灵)', city:'北京/杭州', category:'ai', salary:'400-600/天',
    tags:['实习','视频生成','AIGC'], desc:'参与可灵 AI 视频生成产品方向实习。',
    source:'快手校招', url: URLS.kuaishou('产品实习') },

  { id:'cp-008', company:'蚂蚁集团', role:'AI 产品经理实习', city:'杭州', category:'ai', salary:'350-500/天',
    tags:['实习','金融 AI','B 端'], desc:'参与蚂蚁金融 AI 产品方向实习。',
    source:'蚂蚁校招', url: URLS.ant('产品实习') },

  { id:'cp-009', company:'滴滴', role:'产品经理实习', city:'北京', category:'product', salary:'300-450/天',
    tags:['实习','出行','C 端'], desc:'参与滴滴产品方向实习。',
    source:'滴滴校招', url: URLS.didi('产品实习') },

  { id:'cp-010', company:'拼多多', role:'产品经理实习', city:'上海', category:'product', salary:'350-500/天',
    tags:['实习','电商','推荐'], desc:'参与拼多多产品方向实习。',
    source:'拼多多校招', url: URLS.pdd('产品实习') },

  { id:'cp-011', company:'网易', role:'产品经理实习 (有道)', city:'杭州', category:'product', salary:'300-450/天',
    tags:['实习','教育','C 端'], desc:'参与网易有道产品方向实习。',
    source:'网易校招', url: URLS.netease('产品实习') },

  { id:'cp-012', company:'得物', role:'产品经理实习', city:'上海', category:'product', salary:'300-450/天',
    tags:['实习','电商','潮流'], desc:'参与得物产品方向实习。',
    source:'得物校招', url:'https://hr.dewu.com/jobs?keyword=' + encodeURIComponent('产品实习') },

  { id:'cp-013', company:'大疆 DJI', role:'产品经理实习', city:'深圳', category:'product', salary:'300-500/天',
    tags:['实习','硬件','无人机'], desc:'参与大疆产品方向实习。',
    source:'大疆校招', url:'https://we.dji.com/zh-CN/campus?keyword=' + encodeURIComponent('产品实习') },

  { id:'cp-014', company:'蔚来汽车', role:'产品经理实习 (座舱)', city:'上海', category:'ai', salary:'350-500/天',
    tags:['实习','智能汽车','座舱'], desc:'参与蔚来座舱 AI 产品方向实习。',
    source:'蔚来校招', url:'https://www.nio.com/nio-careers/campus?keyword=' + encodeURIComponent('产品实习') },

  { id:'cp-015', company:'理想汽车', role:'产品经理实习', city:'北京', category:'product', salary:'350-500/天',
    tags:['实习','智能汽车'], desc:'参与理想汽车产品方向实习。',
    source:'理想校招', url:'https://www.lixiang.com/campus-recruit?keyword=' + encodeURIComponent('产品实习') },

  // ============ 应届校招 ============
  { id:'gr-001', company:'字节跳动', role:'AI 产品经理 (应届)', city:'北京/杭州', category:'ai', salary:'25-40K·16薪',
    tags:['应届','大模型','B 端'], desc:'字节 AI 产品经理校招岗,负责 AI 产品方向。',
    source:'字节校招', url: URLS.bytedance('校招 AI') },

  { id:'gr-002', company:'腾讯', role:'产品经理 (应届)', city:'深圳', category:'product', salary:'22-35K·14薪',
    tags:['应届','C 端'], desc:'腾讯产品经理校招岗,负责具体业务方向。',
    source:'腾讯校招', url: URLS.tencent('校招产品经理') },

  { id:'gr-003', company:'阿里巴巴', role:'产品经理 (应届)', city:'杭州', category:'product', salary:'22-35K·16薪',
    tags:['应届','电商'], desc:'阿里产品经理校招岗。',
    source:'阿里校招', url: URLS.alibaba('校招产品经理') },

  { id:'gr-004', company:'美团', role:'产品经理 (应届)', city:'北京', category:'product', salary:'20-32K·15.5薪',
    tags:['应届','本地生活'], desc:'美团产品经理校招岗。',
    source:'美团校招', url: URLS.meituan('校招产品经理') },

  { id:'gr-005', company:'小红书', role:'AI 产品经理 (应届)', city:'上海/北京', category:'ai', salary:'25-40K·15薪',
    tags:['应届','AIGC','内容'], desc:'小红书 AI 产品经理校招岗。',
    source:'小红书校招', url: URLS.xhs('校招 AI') },

  { id:'gr-006', company:'快手', role:'产品经理 (应届)', city:'北京/杭州', category:'product', salary:'20-32K·16薪',
    tags:['应届','短视频'], desc:'快手产品经理校招岗。',
    source:'快手校招', url: URLS.kuaishou('校招产品经理') },

  { id:'gr-007', company:'小米', role:'AI 产品经理 (应届)', city:'北京', category:'ai', salary:'22-35K·14薪',
    tags:['应届','小爱同学','IoT'], desc:'小米 AI 产品经理校招岗。',
    source:'小米校招', url: URLS.xiaomi('校招 AI') },

  { id:'gr-008', company:'华为', role:'产品经理 (应届)', city:'深圳/北京', category:'product', salary:'22-35K·14薪',
    tags:['应届','B 端','政企'], desc:'华为产品经理校招岗,涉及盘古大模型方向。',
    source:'华为校招', url: URLS.huawei('校招产品经理') }
];

window.JOB_DATABASE_CITIES = [...new Set(window.JOB_DATABASE.map(j=>j.city))];
window.JOB_DATABASE_COMPANIES = [...new Set(window.JOB_DATABASE.map(j=>j.company))];

window.SAMPLE_RESUME = `张三 | AI 产品经理(应届) | 北京 | 13800000000 | zhangsan@email.com

【教育背景】
北京大学 计算机科学硕士 2024-2026(预计)
北京大学 计算机科学学士 2020-2024 · GPA 3.8/4.0

【实习经历】
字节跳动 AI 产品实习生 2024.06-2024.12
- 参与豆包 AI 助手功能迭代,主导 3 个核心模块的产品设计
- 与算法团队协作,推动 LLM 在对话场景的落地
- 产出 5 篇 PRD,跟踪上线后核心指标提升 18%

腾讯产品实习生 2023.07-2023.10
- 参与微信视频号推荐策略优化
- 撰写数据分析报告,识别 3 个增长机会点

美团产品实习生 2024.02-2024.05
- 参与美团闪购产品方向,设计并上线"附近商家推荐"功能
- 通过用户调研识别核心痛点,推动产品改进

【项目经历】
校园 AI 助手 - 独立产品经理
- 从 0 到 1 设计并上线北大 AI 答疑 Bot,服务 8000+ 学生
- 使用 Coze + 知识库 RAG 方案,问题准确率 92%

AI 简历分析工具(个人项目) · github.com/xxx
- 基于 GPT-4 + LangChain 搭建简历评估 Web 工具
- 上线 3 个月累计 1.2 万次使用

【技能】
产品: PRD 撰写、Axure、Figma、用户调研、SQL、Python 数据分析
AI: LLM 应用架构、Prompt 工程、RAG、Agent、Coze、Dify
技术: Python、React 入门、Git

【奖项】
• 2023 ACM-ICPC 亚洲区域赛 银奖
• 2023 全国大学生 AI 创新大赛 一等奖
• 2022 互联网+ 全国金奖`;

window.SAMPLE_RESUME_SOCIAL = `张三 | 高级 AI 产品经理 | 北京 | 13800000000 | zhangsan@email.com

【教育背景】
北京大学 计算机科学硕士 2018-2020

【工作经历】
某大厂 · AI 产品经理 2022.06 至今
- 主导 0 到 1 搭建公司 AI 中台产品,服务 20+ 业务方
- 推动 LLM 在客服 / 搜索 / 推荐 3 个核心场景落地,平均提效 35%
- 管理 5 人产品小组,负责需求管理 + 项目推进
- 与算法团队合作定义 Agent / RAG 平台能力,产出 30+ PRD

某创业公司 · 产品经理 2020.07 - 2022.05
- 负责 SaaS 产品核心模块设计与迭代
- 通过数据分析识别 3 个增长机会,推动 GMV 增长 120%

【项目经验】
• 大模型应用平台:主导设计 Agent / RAG / Prompt 三大引擎
• 智能客服升级:推动 AI 替代率从 30% → 75%,节省 50% 人力
• AI 搜索项目:从 0 到 1 上线语义搜索,准确率 92%

【技能】
产品: PRD、Axure、Figma、SQL、Python、Tableau
AI: LLM、Agent、RAG、LangChain、Coze、Dify、向量数据库
管理: 团队管理(5 人)、OKR、敏捷`;

window.SAMPLE_RESUME_CAMPUS = window.SAMPLE_RESUME;

window.SAMPLE_JD_SOCIAL = window.JOB_DATABASE.find(j => j.category==='ai').desc + `\n\n【岗位职责】
1. 负责 AI 产品全生命周期管理,包括需求挖掘、PRD 撰写、上线跟进
2. 与算法、设计、研发团队紧密协作,推动 AI 能力在产品中落地
3. 跟踪核心指标 (DAU/留存/转化),基于数据持续优化产品体验
4. 关注行业趋势,定期输出竞品分析报告
5. 主导至少 1 个从 0 到 1 的 AI 产品模块

【任职要求】
1. 本科及以上学历,计算机/AI/产品等相关专业优先
2. 3 年以上互联网产品经验,有 AI 产品经验者优先
3. 熟悉 LLM / Agent / RAG 等技术原理,有 Coze / Dify 等工具使用经验
4. 优秀的产品 sense,逻辑清晰,数据驱动,沟通能力强
5. 有 B 端产品 / 大模型应用 / 增长方向经验者优先`;

window.SAMPLE_JD_CAMPUS = `字节跳动 - AI 产品经理 (2026 校招)

【岗位职责】
1. 参与豆包 / 抖音 AI 产品方向的需求分析与产品设计
2. 协助 PM 完成 PRD 撰写、用户调研、竞品分析
3. 参与 AI 产品核心功能的方案设计与上线跟进
4. 跟踪核心指标,基于数据提出产品优化建议
5. 与算法、设计、研发同学紧密协作,推动项目落地

【任职要求】
1. 2026 年应届毕业生,本科及以上学历,计算机/AI/产品/设计等相关专业优先
2. 对 AI 产品有强烈兴趣,熟悉 LLM / Prompt / Agent 等基本概念
3. 有产品实习经验 / 个人产品项目 / 互联网大赛经历者优先
4. 优秀的学习能力、逻辑分析能力与沟通表达能力
5. 每周可实习 4 天以上,可实习 6 个月以上,表现优秀可拿 Return Offer

【加分项】
• 有 Coze / Dify / LangChain 等 AI 工具的实践项目
• GitHub / 技术博客 / 产品分析文章
• 校级及以上产品 / 设计 / AI 类比赛获奖`;

window.SAMPLE_JD_INTERN = `字节跳动 - AI 产品实习 (2026 暑期实习)

【岗位职责】
1. 参与豆包 AI 助手产品方向的需求分析与原型设计
2. 协助 PM 完成 PRD 撰写、用户调研、竞品分析
3. 跟踪产品核心数据,产出分析报告
4. 协助 AI 产品核心功能上线跟进

【任职要求】
1. 本科 / 研究生在读,2027 年及以后毕业
2. 计算机 / AI / 产品 / 设计等相关专业优先
3. 对 AI 产品有强烈兴趣,有 Coze / Dify 等工具使用经验
4. 每周可实习 4-5 天,可实习 3-6 个月
5. 有产品 / 设计 / AI 类项目经验者优先

【加分项】
• 有个人 AI 产品项目(Github / Coze 空间 / 独立作品)
• 校级及以上产品 / 设计 / AI 类比赛获奖
• 有互联网公司产品实习经验`;

window.SAMPLE_JD = window.SAMPLE_JD_SOCIAL;
