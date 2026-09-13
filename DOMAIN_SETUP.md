# 自定义域名配置指南 · job-hunter.xin

本文档记录本项目从默认 `*.vercel.app` 切换到自定义域名 `job-hunter.xin` 的完整步骤,供以后重新配置或其他人 fork 时参考。

## 1. Vercel 端配置

1. 登录 https://vercel.com → 进入项目 → `Settings` → `Domains`
2. 在文本框输入 `job-hunter.xin` → 点 `Add`
3. Vercel 会显示 `Invalid Configuration`,并要求添加 DNS 记录
4. Vercel 会自动派生 `www.job-hunter.xin`(308 重定向到 apex)

## 2. 阿里云/万网 DNS 端配置(本项目使用 hichina.com)

DNS 服务器:`dns27.hichina.com` / `dns28.hichina.com`

需要在阿里云 `云解析 DNS` 控制台添加以下 **2 条 A 记录**:

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| `@`     | A       | `216.198.79.1` | 10 分钟 |
| `www`   | A       | `216.198.79.1` | 10 分钟 |

⚠️ **注意**:Vercel 需要 **apex** 和 **www** 两条都解析到项目,只加 `@` 是不够的。

### 添加步骤

1. 阿里云控制台 → `域名` → 找到 `job-hunter.xin` → `DNS 管理`
2. 确认 DNS 服务器是 `dns27.hichina.com` / `dns28.hichina.com`
3. 进入 `解析设置` → 点 `添加记录`
4. 填入第一条记录(@),保存
5. 再次点 `添加记录`,填入第二条记录(www),保存

### 关于"NS 地址不一致"警告

阿里云面板可能会提示"查询到当前域名的NS地址与云解析系统分配的NS地址不一致"。
**这个警告可以忽略** —— Vercel 使用 A 记录做解析,不看 NS 记录。

如果是新注册的域名,还会有"可能存在同步延迟"的提示,建议等几小时再操作。

## 3. 等待 + 验证

- DNS 传播时间:通常 5-30 分钟(新注册域名可能更久)
- Vercel 检测到 DNS 解析后,自动签发 Let's Encrypt SSL 证书(1-2 分钟)
- Vercel Domain 状态从 `Invalid Configuration` → `Valid Configuration`

### 验证命令

```bash
dig job-hunter.xin +short        # 应该返回 216.198.79.1
dig www.job-hunter.xin +short    # 应该返回 216.198.79.1
```

### 浏览器验证

打开 `https://job-hunter.xin/` —— 应该看到职途 AI 应用
打开 `https://www.job-hunter.xin/` —— 应该 301/308 重定向到 apex

## 4. 代码侧需要同步的改动

切换域名后,以下文件需要把硬编码 URL 从 `job-hunter-pro-*.vercel.app` 改为 `job-hunter.xin`:

- `index.html` 的 `<meta property="og:url">` 和 `<meta property="og:image">`
- `README.md` 部署说明部分的示例 URL
- `scripts/build-intro-pdf.js` 里印进 PDF 的网址(改完要重新跑 `node scripts/build-intro-pdf.js`)

## 5. 故障排查

| 现象 | 原因 | 解决 |
|------|------|------|
| Vercel 一直显示 Invalid Configuration | DNS 未生效或记录值错误 | 等更久 / 检查记录值是否一致 |
| 浏览器报 SSL 错误 | 证书未签发 | 等 2-5 分钟,或 `Clear-Cache` 后重试 |
| `https://` 报不安全 | 还在用 HTTP | 直接输 https://,浏览器会自动跳转 |
| `www.job-hunter.xin` 报 404 | 只加了 apex,没加 www | 加第二条 www A 记录 |
