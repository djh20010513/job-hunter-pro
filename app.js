/* JobHunter Pro · 主逻辑 */
(function(){
'use strict';

// ========== 工具 ==========
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const STORAGE_KEY = 'jobhunter_pro_v1';
const state = {
  jobs: [],
  trackers: [], // {id,company,role,loc,url,status,note,createdAt}
  lastFetch: null,
  activeSubtab: 'all' // all / social / campus-grad / campus-intern
};

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){ const d = JSON.parse(raw); Object.assign(state, d); }
  }catch(e){ console.warn(e); }
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function uid(){ return 't_' + Math.random().toString(36).slice(2,10); }
function toast(msg){
  const el = $('#toast'); el.textContent = msg; el.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(()=> el.hidden = true, 2200);
}

// ========== Tab 切换 ==========
$$('.tab').forEach(t => t.addEventListener('click', () => {
  $$('.tab').forEach(x => x.classList.remove('active'));
  $$('.panel').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  $('#tab-' + t.dataset.tab).classList.add('active');
}));
// 程序化切到指定 Tab(供"保存后自动跳转"等场景复用)
function switchToTab(name){
  const t = document.querySelector('.tab[data-tab="'+name+'"]');
  if(t) t.click();
}

// ========== Tab 1: 发现职位 (实时多源聚合) ==========
async function fetchJobs(){
  toast('🔄 正在从 RemoteOK / Remotive / Greenhouse 实时聚合...');
  state.jobs = [];
  state.sources = {}; // 各源成功数

  // 并发抓取所有启用的源
  const tasks = window.JOB_SOURCES.filter(s => s.enabled).map(async src => {
    try {
      let items = [];
      if(src.multi){
        // Greenhouse 多公司
        const cos = src.companies || [];
        for(const co of cos){
          try{
            const url = src.url('', co);
            const r = await fetch(url, { cache: 'no-store' });
            if(!r.ok) continue;
            const data = await r.json();
            const jobs = data.jobs || [];
            jobs.slice(0, 15).forEach(j => { const m = src.map(j, co); if(m) items.push(m); });
          }catch(_){}
        }
      } else {
        const kw = $('#q-keyword').value.trim();
        const url = src.url(kw);
        const r = await fetch(url, { cache: 'no-store' });
        if(!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        const list = Array.isArray(data) ? (src.id==='remoteok' ? data.slice(1) : data) : [];
        const arr = src.id === 'remotive' ? (data.jobs || []) : list;
        arr.slice(0, 30).forEach(j => { const mapped = src.map(j); if(mapped) items.push(mapped); });
      }
      state.sources[src.name] = items.length;
      return items;
    } catch(e){
      console.warn('Source failed:', src.name, e);
      state.sources[src.name] = 0;
      return [];
    }
  });

  const results = await Promise.all(tasks);
  results.forEach(arr => state.jobs.push(...arr));

  // 兜底:如果实时源全部失败,加入内置数据库
  if(state.jobs.length === 0){
    state.jobs = [...window.JOB_DATABASE];
    toast('⚠️ 实时源暂时不可用,已展示精选职位库');
  } else {
    // 实时岗位优先,内置数据库作为补充
    state.jobs = [...state.jobs, ...window.JOB_DATABASE];
  }

  // 去重 (按 company+role)
  const seen = new Set();
  state.jobs = state.jobs.filter(j => {
    const key = (j.company + '|' + j.role).toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key); return true;
  });

  state.lastFetch = new Date();
  save();
  renderJobs();

  const ok = Object.values(state.sources).reduce((a,b)=>a+b, 0);
  const summary = Object.entries(state.sources).map(([k,v])=>`${k}:${v}`).join(' / ');
  toast(`✅ 实时抓到 ${ok} 个真实岗位 (${summary})`);
}

function renderJobs(){
  const kw = $('#q-keyword').value.trim().toLowerCase();
  const co = $('#q-company').value;
  const ci = $('#q-city').value;
  const ca = $('#q-category').value;

  const list = state.jobs.filter(j => {
    if(co && j.company !== co) return false;
    if(ci && j.city !== ci) return false;
    if(ca && j.category !== ca) return false;
    if(state.activeSubtab && state.activeSubtab !== 'all'){
      const jobType = window.detectJobType(j.role);
      if(jobType !== state.activeSubtab) return false;
    }
    if(kw){
      const hay = (j.role + ' ' + j.company + ' ' + j.tags.join(' ') + ' ' + j.desc).toLowerCase();
      if(!hay.includes(kw)) return false;
    }
    return true;
  });

  $('#result-count').textContent = list.length;
  const fetchInfo = state.lastFetch ? '最近抓取: ' + state.lastFetch.toLocaleString('zh-CN') : '尚未抓取';
  // 分类统计
  const socialN = list.filter(j => window.detectJobType(j.role) === 'social').length;
  const gradN = list.filter(j => window.detectJobType(j.role) === 'campus-grad').length;
  const internN = list.filter(j => window.detectJobType(j.role) === 'campus-intern').length;
  $('#last-fetch').innerHTML = `${fetchInfo} · 🧑‍💼社招 ${socialN} · 🎓校招 ${gradN} · 📚实习 ${internN}`;

  const wrap = $('#job-list');
  if(list.length === 0){
    wrap.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--muted)">未找到匹配职位,试试调整关键词或筛选条件</div>';
    return;
  }
  wrap.innerHTML = list.map(j => {
    const jobType = window.detectJobType(j.role);
    const typeStyle = jobType === 'campus-intern'
      ? 'background:rgba(155,108,255,.15);color:#b89bff;border-color:rgba(155,108,255,.4);font-weight:700'
      : jobType === 'campus-grad'
      ? 'background:rgba(255,181,71,.15);color:var(--warn);border-color:rgba(255,181,71,.4);font-weight:700'
      : 'background:rgba(108,140,255,.15);color:var(--primary);border-color:rgba(108,140,255,.4);font-weight:700';
    const typeLabel = window.JOB_TYPE_LABEL[jobType] || '社招';
    return `
    <div class="job-card">
      <div class="top">
        <div>
          <h3>${j.role}</h3>
          <div class="company">${j.company} · ${j.city}</div>
        </div>
        <div class="salary">${j.salary}</div>
      </div>
      <div class="tags">
        <span class="tag" style="${typeStyle}">${typeLabel}</span>
        ${j.tags.map(t => `<span class="tag ${j.category==='ai'?'ai':''}">${t}</span>`).join('')}
      </div>
      <div class="meta">${j.desc ? j.desc.slice(0, 80) + '...' : ''}</div>
      <div class="meta">📡 ${j.source}</div>
      <div class="row">
        <button class="icon-btn" data-act="viewjd" data-id="${j.id}">📄 完整 JD</button>
        <div class="actions-mini">
          <button class="icon-btn" data-act="add" data-id="${j.id}">+ 加入追踪</button>
          <button class="icon-btn" data-act="copy" data-id="${j.id}">📋 复制 JD</button>
        </div>
      </div>
    </div>
  `;}).join('');
}

// 显示完整 JD 弹窗
function showJDModal(job){
  const fullJD = window.buildFullJD(job);
  const bossUrl = `https://www.zhipin.com/web/geek/job?query=${encodeURIComponent(job.role)}`;
  const lagouUrl = `https://www.lagou.com/wn/jobs?kd=${encodeURIComponent(job.role)}`;
  const lietouUrl = `https://www.liepin.com/zhaopin/?key=${encodeURIComponent(job.role)}`;

  const html = `
    <div class="jd-modal-card">
      <div class="jd-head">
        <div>
          <h3>${job.role}</h3>
          <div class="jd-meta">${job.company} · ${job.city} · ${job.salary}</div>
        </div>
        <button class="icon-btn" data-close="jd" style="font-size:18px;padding:4px 10px">✕</button>
      </div>
      <div class="jd-actions-bar">
        <button class="btn primary" data-act="copy-jd">📋 复制完整 JD</button>
        <button class="btn ghost" data-act="goto-match">🎯 粘贴到匹配分析</button>
      </div>
      <div class="jd-text">${fullJD.replace(/</g,'&lt;')}</div>
      <div class="jd-channels">
        <h4>🔗 多渠道投递</h4>
        <div class="channels">
          <a class="channel" href="${job.url}" target="_blank">🌐 ${job.source}</a>
          <a class="channel" href="${bossUrl}" target="_blank">💼 Boss 直聘</a>
          <a class="channel" href="${lagouUrl}" target="_blank">🔍 拉勾网</a>
          <a class="channel" href="${lietouUrl}" target="_blank">🎯 猎聘</a>
        </div>
      </div>
    </div>
  `;

  let modal = $('#modal-jd');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'modal-jd';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }
  modal.innerHTML = html;
  modal.hidden = false;

  modal.querySelector('[data-close="jd"]').onclick = () => modal.hidden = true;
  modal.onclick = e => { if(e.target === modal) modal.hidden = true; };
  modal.querySelector('[data-act="copy-jd"]').onclick = () => {
    navigator.clipboard.writeText(fullJD).then(() => toast('✅ 完整 JD 已复制 (含岗位职责/任职要求/福利)'));
  };
  modal.querySelector('[data-act="goto-match"]').onclick = () => {
    $('#jd-input').value = fullJD;
    document.querySelector('.tab[data-tab="match"]').click();
    modal.hidden = true;
    toast('✅ JD 已填充到匹配分析 Tab');
  };
}

function initDiscover(){
  // 填充公司/城市
  $('#q-company').innerHTML = '<option value="">全部公司</option>' +
    window.JOB_DATABASE_COMPANIES.map(c => `<option>${c}</option>`).join('');
  $('#q-city').innerHTML = '<option value="">全部城市</option>' +
    window.JOB_DATABASE_CITIES.map(c => `<option>${c}</option>`).join('');

  $('#btn-search').addEventListener('click', renderJobs);
  $('#q-keyword').addEventListener('keydown', e => { if(e.key==='Enter') renderJobs(); });
  ['q-company','q-city','q-category'].forEach(id => $('#'+id).addEventListener('change', renderJobs));

  // 二级 Tab: 全部 / 社招 / 校招 / 实习
  $$('#discover-subtabs .subtab').forEach(st => st.addEventListener('click', () => {
    $$('#discover-subtabs .subtab').forEach(x => x.classList.remove('active'));
    st.classList.add('active');
    state.activeSubtab = st.dataset.sub;
    renderJobs();
  }));
  $('#btn-refresh').addEventListener('click', fetchJobs);
  $('#btn-source-info').addEventListener('click', () => $('#modal-source').hidden = false);
  $('#btn-source-close').addEventListener('click', () => $('#modal-source').hidden = true);
  // 点击遮罩关闭 / Esc 关闭
  $('#modal-source').addEventListener('click', e => { if(e.target === $('#modal-source')) $('#modal-source').hidden = true; });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') $('#modal-source').hidden = true; });

  // 列表事件委托
  $('#job-list').addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]'); if(!btn) return;
    const job = state.jobs.find(j => j.id === btn.dataset.id); if(!job) return;
    if(btn.dataset.act === 'add'){
      openTrackerModal({
        company: job.company, role: job.role, loc: job.city,
        url: job.url, status: 'wishlist', note: '来源: ' + job.source + '\n\n' + window.buildFullJD(job)
      });
    } else if(btn.dataset.act === 'copy'){
      const fullJD = window.buildFullJD(job);
      navigator.clipboard.writeText(fullJD).then(()=>toast('✅ 完整 JD 已复制 (含岗位职责/任职要求/福利)'));
    } else if(btn.dataset.act === 'viewjd'){
      showJDModal(job);
    }
  });
}

// ========== Tab 2: 追踪看板 ==========
const STATUS_COLUMNS = [
  { key:'wishlist', label:'🌱 待投递' },
  { key:'applied',  label:'📨 已投递' },
  { key:'written',  label:'📝 笔试中' },
  { key:'interview-1', label:'🎤 一面' },
  { key:'interview-2', label:'🎤 二面' },
  { key:'interview-3', label:'🎤 三面' },
  { key:'offer',    label:'🎉 已拿 Offer' },
  { key:'rejected', label:'❌ 已拒' }
];

function renderKanban(){
  const wrap = $('#kanban');
  // 分 4 列: 进行中 / 已投 / Offer&拒 / 全部(每 2 个一组)
  const groups = [
    { title:'进行中', items:['wishlist','applied','written','interview-1','interview-2','interview-3'] },
    { title:'已拿 Offer', items:['offer'] },
    { title:'已拒', items:['rejected'] },
    { title:'全部', items: STATUS_COLUMNS.map(c=>c.key) }
  ];
  wrap.innerHTML = groups.map(g => `
    <div class="col">
      <h4>${g.title} <span class="count">${g.items.reduce((n,k)=>n + state.trackers.filter(t=>t.status===k).length,0)}</span></h4>
      ${g.items.map(k => {
        const col = STATUS_COLUMNS.find(c => c.key === k);
        const items = state.trackers.filter(t => t.status === k);
        return `
          <div style="margin-bottom:10px">
            <div style="font-size:11px;color:var(--muted);margin-bottom:4px">${col.label}</div>
            ${items.map(t => `
              <div class="card" data-id="${t.id}">
                <div class="c1">${t.role}</div>
                <div class="c2">${t.company}</div>
                <div class="c3">${t.loc || ''}</div>
                ${t.note ? `<div class="c3" style="margin-top:4px">${t.note.slice(0,40)}${t.note.length>40?'...':''}</div>` : ''}
                <div class="ctrls">
                  <button data-act="edit">✏️ 编辑</button>
                  <button data-act="del">🗑 删除</button>
                </div>
              </div>
            `).join('') || '<div style="font-size:11px;color:var(--muted);padding:6px;text-align:center">— 空 —</div>'}
          </div>
        `;
      }).join('')}
    </div>
  `).join('');
}

let editingId = null;
function openTrackerModal(item){
  editingId = item.id || null;
  $('#modal-title').textContent = item.id ? '编辑投递' : '新增投递';
  $('#m-company').value = item.company || '';
  $('#m-role').value = item.role || '';
  $('#m-loc').value = item.loc || '';
  $('#m-url').value = item.url || '';
  $('#m-status').value = item.status || 'wishlist';
  $('#m-note').value = item.note || '';
  $('#modal-tracker').hidden = false;
}
function closeTrackerModal(){
  $('#modal-tracker').hidden = true; editingId = null;
}
function saveTracker(){
  const company = $('#m-company').value.trim();
  const role = $('#m-role').value.trim();
  if(!company || !role){ toast('⚠️ 公司与职位必填'); return; }
  const item = {
    id: editingId || uid(),
    company, role,
    loc: $('#m-loc').value.trim(),
    url: $('#m-url').value.trim(),
    status: $('#m-status').value,
    note: $('#m-note').value.trim(),
    createdAt: editingId ? (state.trackers.find(t=>t.id===editingId)||{}).createdAt : Date.now()
  };
  if(editingId){
    const idx = state.trackers.findIndex(t => t.id === editingId);
    if(idx >= 0) state.trackers[idx] = item;
  } else {
    state.trackers.push(item);
  }
  save(); renderKanban(); closeTrackerModal();
  // 保存后自动跳到追踪看板,用户能立刻看到新卡片,无需手动切 Tab
  switchToTab('tracker');
  toast('✅ 已加入追踪看板,可继续编辑阶段/备注');
}

function initTracker(){
  $('#btn-add-tracker').addEventListener('click', () => openTrackerModal({}));
  $('#btn-modal-cancel').addEventListener('click', closeTrackerModal);
  $('#btn-modal-save').addEventListener('click', saveTracker);
  $('#modal-tracker').addEventListener('click', e => { if(e.target === $('#modal-tracker')) closeTrackerModal(); });
  $('#kanban').addEventListener('click', e => {
    const card = e.target.closest('.card'); if(!card) return;
    const id = card.dataset.id;
    const item = state.trackers.find(t => t.id === id); if(!item) return;
    if(e.target.dataset.act === 'edit') openTrackerModal(item);
    else if(e.target.dataset.act === 'del'){
      if(confirm('确认删除该投递记录?')){
        state.trackers = state.trackers.filter(t => t.id !== id);
        save(); renderKanban(); toast('🗑 已删除');
      }
    } else {
      openTrackerModal(item);
    }
  });
}

// ========== Tab 3: JD 匹配 ==========
function tokenize(text){
  return (text||'').toLowerCase().replace(/[，。、；:,.!?()()【】\[\]\n\r\t]/g,' ')
    .split(/\s+/).filter(w => w.length >= 2);
}

// 中英文混合关键词库(基于行业常见关键词)
const KEYWORDS_BANK = {
  // 硬技能
  hard: ['PRD','Axure','SQL','Python','React','Vue','Figma','Sketch','用户调研','数据分析','A/B 测试','竞品分析','产品规划','项目管理','敏捷','Scrum'],
  ai: ['LLM','大模型','GPT','Claude','Agent','RAG','Prompt','Coze','Dify','LangChain','向量数据库','Embedding','微调','SFT','RLHF','多模态','AIGC','推荐系统','NLP','CV','语音'],
  biz: ['B 端','C 端','SaaS','电商','社交','内容','增长','商业化','广告','运营','策略','增长黑客','留存','转化','DAU','GMV'],
  domain: ['金融','教育','医疗','电商','社交','游戏','短视频','直播','本地生活','出行','物流','企业服务']
};

function analyzeMatch(){
  const jd = $('#jd-input').value.trim();
  const resume = $('#resume-input').value.trim();
  if(!jd || !resume){ toast('⚠️ 请同时填写 JD 与简历'); return; }

  const jdLower = jd.toLowerCase();
  const resLower = resume.toLowerCase();

  const all = [...KEYWORDS_BANK.hard, ...KEYWORDS_BANK.ai, ...KEYWORDS_BANK.biz, ...KEYWORDS_BANK.domain];
  const matched = [], missed = [];
  for(const k of all){
    if(jdLower.includes(k.toLowerCase())){
      if(resLower.includes(k.toLowerCase())) matched.push(k);
      else missed.push(k);
    }
  }

  // 学历/年限粗略判断
  const yearMatch = (jd.match(/(\d+)\s*年/)||[])[1];
  const resYears = (resume.match(/(\d+)\s*年/)||[])[1];

  // 计算分数
  let score = 0;
  if(matched.length > 0){
    score = Math.min(100, Math.round(matched.length / Math.max(1, matched.length + missed.length) * 100));
  }
  // 学历/年限微调
  if(yearMatch && resYears && parseInt(resYears) >= parseInt(yearMatch)) score = Math.min(100, score + 5);

  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warn)' : 'var(--danger)';
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - score/100);

  $('#match-result').hidden = false;
  $('#match-result').innerHTML = `
    <div class="score-box">
      <div class="score-ring">
        <svg width="110" height="110">
          <circle cx="55" cy="55" r="45" fill="none" stroke="#2a3361" stroke-width="10"/>
          <circle cx="55" cy="55" r="45" fill="none" stroke="${color}" stroke-width="10"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            stroke-linecap="round"/>
        </svg>
        <div class="val" style="color:${color}">${score}</div>
      </div>
      <div class="score-info">
        <h3>匹配度 ${score >= 80 ? '🟢 高度匹配' : score >= 60 ? '🟡 一般匹配' : '🔴 较弱匹配'}</h3>
        <p>检测到 ${matched.length + missed.length} 个 JD 关键词 · ${matched.length} 项命中简历 · ${missed.length} 项缺失</p>
      </div>
    </div>

    <div class="section-block">
      <h4>✅ 匹配的原因</h4>
      <div>${matched.length ? matched.map(m => `<span class="tag-pill match">${m}</span>`).join('') : '<span style="color:var(--muted)">未识别到明确匹配项</span>'}</div>
      <ul class="reason-list" style="margin-top:10px">
        ${matched.length ? matched.slice(0,8).map(m => `<li>简历中提及 <b>${m}</b>,与 JD 要求吻合</li>`).join('') : '<li>建议补充更多项目细节与可量化成果</li>'}
      </ul>
    </div>

    <div class="section-block">
      <h4>❌ 不匹配的原因 / 改进建议</h4>
      <div>${missed.length ? missed.map(m => `<span class="tag-pill miss">${m}</span>`).join('') : '<span style="color:var(--muted)">已覆盖 JD 全部关键要求,表现优秀 ✨</span>'}</div>
      <ul class="reason-list" style="margin-top:10px">
        ${missed.length ? missed.slice(0,8).map(m => `<li>JD 要求 <b>${m}</b>,简历中未体现 → 建议补充相关项目或学习计划</li>`).join('') : '<li>继续保持亮点表达</li>'}
      </ul>
    </div>

    <div class="section-block">
      <h4>📌 总结建议</h4>
      <ul class="reason-list">
        <li>${score >= 80 ? '简历与 JD 高度契合,建议立即投递并准备面试故事' : score >= 60 ? '匹配度中等,建议针对缺失项补充 1-2 个相关项目后投递' : '建议调整简历侧重点,围绕 JD 重写项目经历后再投递'}</li>
        <li>优先在简历前 1/3 突出 <b>${matched.slice(0,3).join('、')||'核心能力'}</b> 等亮点</li>
        <li>缺失项中优先补齐 <b>${missed.slice(0,3).join('、')||'无'}</b></li>
      </ul>
    </div>

    <div class="section-block" style="text-align:center;padding:18px;background:linear-gradient(135deg,rgba(62,207,142,.08),rgba(108,140,255,.08));border-radius:12px;border:1px solid rgba(62,207,142,.3)">
      <p style="margin:0 0 12px;font-size:14px;color:var(--muted)">${score >= 60 ? '✅ 匹配度不错,基于这份 JD 智能改写你的简历,投递通过率更高' : '💡 即使匹配度一般,改写后的简历也能更精准地命中关键词'}</p>
      <button class="goto-optimize" id="btn-goto-optimize">
        ✨ 基于此 JD 一键改写简历 →
      </button>
    </div>
  `;

  // 绑定跳转:把 JD + 简历带到 Tab 4 并自动触发优化
  $('#btn-goto-optimize').onclick = () => {
    $('#opt-jd').value = jd;
    $('#opt-resume').value = resume;
    document.querySelector('.tab[data-tab="optimize"]').click();
    setTimeout(() => optimize(), 150);
    toast('✨ 正在基于此 JD 改写你的简历...');
  };

  $('#match-result').scrollIntoView({ behavior:'smooth', block:'start' });
}

function initMatch(){
  // 简历持久化加载
  const savedResume = localStorage.getItem('jobhunter_resume');
  const savedResumeName = localStorage.getItem('jobhunter_resume_name');
  if(savedResume){
    $('#resume-input').value = savedResume;
    const status = $('#resume-status');
    status.textContent = '✅ 已加载: ' + (savedResumeName || '历史简历');
    status.classList.add('uploaded');
  }

  // PDF.js worker
  if(window.pdfjsLib){
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // 文件上传
  $('#resume-file').addEventListener('change', async e => {
    const file = e.target.files[0]; if(!file) return;
    const name = file.name;
    const status = $('#resume-status');
    status.textContent = '⏳ 正在解析 ' + name + '...';
    status.classList.remove('uploaded');

    try {
      let text = '';
      if(/\.pdf$/i.test(file.name)){
        if(!window.pdfjsLib){ throw new Error('PDF 解析库未加载,请检查网络'); }
        const buf = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({data: buf}).promise;
        for(let i=1;i<=pdf.numPages;i++){
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          text += tc.items.map(it => it.str).join(' ') + '\n';
        }
      } else if(/\.(docx|doc)$/i.test(file.name)){
        // 简单读取 (浏览器内置不支持 docx 解析,提示用户)
        throw new Error('Word 解析暂不支持,请另存为 PDF / TXT 后再上传');
      } else {
        text = await file.text();
      }

      if(!text || text.trim().length < 20){
        throw new Error('简历内容为空或太短,可能是扫描件 PDF');
      }

      $('#resume-input').value = text.trim();
      localStorage.setItem('jobhunter_resume', text.trim());
      localStorage.setItem('jobhunter_resume_name', name);
      status.textContent = '✅ 已加载: ' + name + ' (' + Math.round(text.length/100)/10 + 'k 字)';
      status.classList.add('uploaded');
      toast('✅ 简历已解析并保存,后续无需重复上传');
    } catch(err){
      status.textContent = '❌ 解析失败: ' + err.message;
      toast('⚠️ ' + err.message);
    }
    e.target.value = '';
  });

  // 清除简历
  $('#btn-clear-resume').addEventListener('click', () => {
    if(!confirm('确认清除已上传的简历?')) return;
    $('#resume-input').value = '';
    localStorage.removeItem('jobhunter_resume');
    localStorage.removeItem('jobhunter_resume_name');
    const status = $('#resume-status');
    status.textContent = '未上传';
    status.classList.remove('uploaded');
    toast('🗑 已清除');
  });

  // 加载示例(支持社招/校招/实习切换)
  function loadSample(type){
    let resumeKey = 'SAMPLE_RESUME_SOCIAL';
    let jdKey = 'SAMPLE_JD_SOCIAL';
    let label = '社招';
    if(type === 'campus-grad'){ resumeKey = 'SAMPLE_RESUME_CAMPUS'; jdKey = 'SAMPLE_JD_CAMPUS'; label = '校招 (应届)'; }
    else if(type === 'campus-intern'){ resumeKey = 'SAMPLE_RESUME_CAMPUS'; jdKey = 'SAMPLE_JD_INTERN'; label = '实习'; }
    $('#resume-input').value = window[resumeKey];
    $('#jd-input').value = window[jdKey];
    toast('✅ 已载入' + label + '示例 JD + 简历');
  }
  $('#btn-load-resume').addEventListener('click', () => loadSample($('#q-sample-type').value));
  $('#q-sample-type').addEventListener('change', () => loadSample($('#q-sample-type').value));

  $('#btn-analyze').addEventListener('click', analyzeMatch);
}

// ========== Tab 4: 简历优化 ==========
function optimize(){
  const jd = $('#opt-jd').value.trim();
  const resume = $('#opt-resume').value.trim();
  if(!jd || !resume){ toast('⚠️ 请同时填写 JD 与简历'); return; }

  const jdLower = jd.toLowerCase();
  const all = [...KEYWORDS_BANK.hard, ...KEYWORDS_BANK.ai, ...KEYWORDS_BANK.biz, ...KEYWORDS_BANK.domain];
  const target = all.filter(k => jdLower.includes(k.toLowerCase()));
  const missing = target.filter(k => !resume.toLowerCase().includes(k.toLowerCase()));

  // 把简历按"段落"拆分
  const lines = resume.split('\n').map(l => l.trim()).filter(Boolean);
  // 找出"工作/项目"段落(以【或-开头的)
  const sections = [];
  let cur = null;
  for(const l of lines){
    if(/^【.+】$/.test(l)){ if(cur) sections.push(cur); cur = { title:l, items:[] }; }
    else { if(!cur) cur = { title:'通用', items:[] }; cur.items.push(l); }
  }
  if(cur) sections.push(cur);

  // 为每个段落生成改写
  const rewrites = sections.map(sec => {
    const before = sec.title + '\n' + sec.items.join('\n');
    // 强化:在每个 item 后追加量化提示 + 嵌入 JD 关键词
    const newItems = sec.items.map(line => {
      let enhanced = line;
      // 如果是 bullet 项,补强
      if(line.startsWith('-') || /^\d+\./.test(line)){
        if(!/[\d%万亿]/.test(line)){
          enhanced = line + ' [建议补充量化指标,如:用户量提升 X% / 节省 X 工时]';
        }
        if(missing.length){
          // 在最后加括号建议嵌入关键词
          enhanced += ` [可考虑体现:${missing.slice(0,2).join('、')}]`;
        }
      }
      return enhanced;
    });
    const after = sec.title + '\n' + newItems.join('\n');
    return { title: sec.title, before, after };
  });

  // 顶部建议
  const tips = [];
  if(missing.length){
    tips.push(`建议在简历前 1/3 突出以下 JD 关键词:${missing.slice(0,5).join('、')}`);
  }
  tips.push('每个工作/项目条目尽量"动词 + 对象 + 量化结果"三要素');
  tips.push('若投递 AI 产品岗,务必补充 LLM / Agent / RAG / Prompt 等技术认知');
  tips.push('使用 STAR 法重写项目经历 (Situation/Task/Action/Result)');

  $('#opt-result').hidden = false;
  $('#opt-result').innerHTML = `
    <div class="section-block">
      <h4>📌 整体改写建议</h4>
      <ul class="reason-list">${tips.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>

    <div class="section-block">
      <h4>🧩 缺失的 JD 关键词</h4>
      <div>${missing.length ? missing.map(m => `<span class="tag-pill miss">${m}</span>`).join('') : '<span style="color:var(--success)">已覆盖所有关键词 ✨</span>'}</div>
    </div>

    <div class="section-block">
      <h4>✍️ 逐段改写(原文 → 建议)</h4>
      ${rewrites.map((r, i) => `
        <div class="optimize-block">
          <div class="hd"><span class="lbl">段落 ${i+1}: ${r.title}</span></div>
          <div class="before">${r.before}</div>
          <div class="after">${r.after}</div>
        </div>
      `).join('')}
    </div>

    <div class="section-block">
      <h4>📥 一键复制改写后的简历</h4>
      <button class="btn primary" id="btn-copy-resume">📋 复制全部</button>
    </div>
  `;

  $('#btn-copy-resume').onclick = () => {
    const text = rewrites.map(r => r.after).join('\n\n');
    navigator.clipboard.writeText(text).then(()=> toast('✅ 改写后的简历已复制'));
  };
  $('#opt-result').scrollIntoView({ behavior:'smooth', block:'start' });
}

function initOptimize(){
  // 自动载入已保存的简历
  const savedResume = localStorage.getItem('jobhunter_resume');
  if(savedResume && !$('#opt-resume').value){
    $('#opt-resume').value = savedResume;
  }

  $('#btn-optimize').addEventListener('click', optimize);
  $('#btn-load-resume2').addEventListener('click', () => {
    $('#opt-resume').value = $('#resume-input').value || window.SAMPLE_RESUME;
    $('#opt-jd').value = $('#jd-input').value || window.SAMPLE_JD;
    toast('✅ 已载入已保存的简历与 JD');
  });
}

// ========== 初始化 ==========
load();
initDiscover();
initTracker();
initMatch();
initOptimize();

if(state.jobs.length === 0){
  fetchJobs();
} else {
  renderJobs();
  renderKanban();
}

})();