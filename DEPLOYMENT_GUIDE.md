# 部署到 Netlify 并实现数据变化检测指南

本指南将帮助您将 Interpretive Friction 应用部署到 Netlify，并确保数据能够正确记录到后端服务器。

## 部署选项

### 选项 1: 将后端部署到云服务（推荐）

这是最稳定和可靠的部署方式，适合生产环境。

#### 步骤 1: 准备后端代码

1. 确保您的后端代码（server.js）已准备好部署。
2. 检查 server.js 中的端口配置，确保它监听正确的端口（通常是环境变量指定的端口）。

#### 步骤 2: 部署后端到云服务

您可以选择以下任一云服务提供商：

- [Render](https://render.com/)
- [Railway](https://railway.app/)
- [Fly.io](https://fly.io/)
- [Heroku](https://www.heroku.com/)

以 Render 为例：

1. 创建一个 Render 账户。
2. 创建一个新的 Web Service。
3. 连接您的 GitHub 仓库或上传代码。
4. 配置构建命令和启动命令：
   - 构建命令：`npm install`
   - 启动命令：`node server.js`
5. 设置环境变量：
   - `RECORDING_PORT`：设置为 Render 提供的端口（通常是 10000）
   - `ALLOWED_ORIGIN`：设置为您的 Netlify 域名，例如 `https://test0415.netlify.app`
6. 部署后端服务，获取后端 URL，例如 `https://your-backend.onrender.com`

#### 步骤 3: 配置 Netlify 前端

1. 登录到 Netlify 并打开您的项目。
2. 进入 "Site settings" -> "Environment variables"。
3. 添加以下环境变量：
   - `VITE_RECORDING_API_BASE_URL`：设置为您的后端 URL，例如 `https://your-backend.onrender.com/api`
   - 其他 LLM 相关的环境变量（如 `VITE_LLM_PROVIDER`, `VITE_QWEN_API_KEY` 等）
4. 保存更改并触发重新部署。

#### 步骤 4: 验证部署

1. 访问您的 Netlify 网站。
2. 打开浏览器控制台，检查是否有任何 API 错误。
3. 使用应用程序，然后检查后端数据库是否记录了数据。
4. 您可以通过访问 `https://your-backend.onrender.com/api/export?format=json` 来验证数据是否被正确记录。

### 选项 2: 使用本地后端与隧道服务（用于测试）

如果您想使用本地后端进行测试，可以使用隧道服务如 ngrok。

#### 步骤 1: 安装 ngrok

1. 访问 [ngrok 下载页面](https://ngrok.com/download)。
2. 下载并安装适用于您操作系统的 ngrok。
3. 注册 ngrok 账户并获取 authtoken。

#### 步骤 2: 启动本地后端

在项目根目录下运行：

```bash
npm run server
```

#### 步骤 3: 启动 ngrok

在新的终端窗口中运行：

```bash
ngrok http 8787
```

这将创建一个从互联网到您本地后端的隧道。记下 ngrok 提供的 URL（例如 `https://abc123.ngrok.io`）。

#### 步骤 4: 配置 Netlify 前端

1. 登录到 Netlify 并打开您的项目。
2. 进入 "Site settings" -> "Environment variables"。
3. 添加以下环境变量：
   - `VITE_RECORDING_API_BASE_URL`：设置为您的 ngrok URL，例如 `https://abc123.ngrok.io/api`
4. 保存更改并触发重新部署。

#### 步骤 5: 更新本地 .env 文件

确保您的本地 .env 文件包含以下配置：

```
ALLOWED_ORIGIN=https://test0415.netlify.app
```

#### 步骤 6: 验证部署

1. 访问您的 Netlify 网站。
2. 打开浏览器控制台，检查是否有任何 API 错误。
3. 使用应用程序，然后检查本地数据库是否记录了数据。
4. 您可以通过访问 `https://abc123.ngrok.io/api/export?format=json` 来验证数据是否被正确记录。

## 常见问题

### Q: 为什么我的数据没有记录到后端？

A: 可能的原因包括：
1. `VITE_RECORDING_API_BASE_URL` 环境变量未正确设置。
2. 后端服务未运行或无法访问。
3. CORS 配置不正确（检查 `ALLOWED_ORIGIN` 环境变量）。
4. 网络问题导致请求失败。

### Q: 如何检查 Netlify 网站是否正确连接到后端？

A: 您可以：
1. 打开浏览器控制台，检查网络请求。
2. 直接访问后端的 `/api/health` 端点，应该返回 `{ "ok": true }`。
3. 检查后端日志，看是否有接收到的请求。

### Q: ngrok URL 每次重启都会变化，如何处理？

A: ngrok 免费版确实会提供临时 URL。对于持久测试，考虑：
1. 升级到 ngrok 付费版以获取固定域名。
2. 将后端部署到云服务（选项 1）。

### Q: 我可以在 Netlify 上部署后端吗？

A: Netlify 主要用于静态网站托管，不适合运行 Node.js 后端服务器。您需要将后端部署到支持服务器端代码的云服务。

## 总结

通过以上步骤，您应该能够成功将 Interpretive Friction 应用部署到 Netlify，并确保数据能够正确记录到后端服务器。选择选项 1（将后端部署到云服务）可以获得更稳定的部署，而选项 2（使用本地后端与隧道服务）则适合快速测试和开发。
