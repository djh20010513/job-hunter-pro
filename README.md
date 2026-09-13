# 职途 AI · 智能求职助手

> 聚合 / 追踪 / 匹配 / 优化 - 给求职者的一站式工作台

## 📦 项目说明

**项目位置**：`/Users/djh/job-hunter-pro/`
**技术栈**：纯 HTML + CSS + JavaScript（单页 Web App，无后端依赖）
**运行**：`python3 -m http.server 8765` → http://localhost:8765/

## 🚀 部署到 Vercel（3 步，5 分钟）

### 第 1 步：注册 GitHub（如果你没有）

打开 https://github.com 注册账号。

### 第 2 步：建仓库 + 推代码

打开终端（Mac `Cmd + 空格` 搜"终端"），逐行执行：

```bash
cd /Users/djh/job-hunter-pro

git init
git add .
git commit -m "init: 职途 AI 智能求职助手"
git branch -M main
```

然后打开 https://github.com/new ，新建仓库：
- Repository name：`job-hunter-pro`
- Public
- **不要**勾 "Add a README file"

点 **Create repository**。**不要关闭**打开的页面。

继续在终端执行（替换 `你的用户名`）：

```bash
git remote add origin https://github.com/你的用户名/job-hunter-pro.git
git push -u origin main
```

⚠️ 如果 push 时弹出登录框，登录你的 GitHub 账号（密码或 Token）。

### 第 3 步：在 Vercel 部署

1. 打开 https://vercel.com/signup
2. 点 **Continue with GitHub** 登录
3. 授权 Vercel 访问你的 GitHub
4. 进入 Dashboard 后点 **Add New → Project**
5. 在仓库列表里找到 `job-hunter-pro` → 点 **Import**
6. **保持所有默认设置**，直接点 **Deploy**（不要改任何东西）

等待 30-60 秒，部署完成 🎉

## 🌐 你的永久网址

部署成功后，你会得到类似这样的网址：

```
https://job-hunter.xin
```

或者（如果你之前用过其他用户名）：

```
https://job-hunter.xin
```

**任何人任何时候都能打开。**

## 📁 项目结构

```
job-hunter-pro/
├── index.html         # 主页面
├── styles.css         # 样式
├── data.js            # 模拟职位数据库(国内大厂/中厂/小厂)
├── app.js             # 业务逻辑(4 大模块:发现/追踪/匹配/优化)
├── package.json       # 项目配置
├── vercel.json        # Vercel 部署配置
└── .gitignore
```

## 🎯 4 大功能

1. **🔍 职位发现**：123+ 真实国内公司职位（字节/小红书/B站等），支持关键词/公司/城市/校招/社招筛选
2. **📋 求职追踪**：Kanban 看板，状态流转（待投递→已投递→笔试→一面→Offer）
3. **🎯 JD 匹配**：粘贴 JD + 简历，AI 智能打分 0-100，给出匹配原因 + 改进建议
4. **✨ 简历优化**：基于 JD 改写简历，逐条建议 + 一键复制

## 🔧 修改内容

所有内容在 `data.js`（职位）+ `app.js`（业务逻辑）+ `index.html`（结构）。

修改后：
```bash
cd /Users/djh/job-hunter-pro
git add .
git commit -m "update content"
git push
```

Vercel 会**自动重新部署**，1 分钟内网址更新。

## 💡 后续优化方向

- [ ] 接入真实 API（拉勾/猎聘/智联）
- [ ] PDF 简历解析
- [ ] 求职时间线数据可视化
- [ ] 多用户系统 + 云端同步
- [ ] AI 面试模拟

## 🌟 体验地址

本地预览：`http://localhost:8765/`
线上部署：https://job-hunter.xin（已配置自定义域名）
