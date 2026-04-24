# 使用 Render 部署后端指南

本指南将帮助您将 Interpretive Friction 的后端服务器部署到 Render，并配置 Netlify 以连接到它。

## 前置要求

1. 一个 Render 账户（免费账户即可）
2. 您的代码已上传到 GitHub 仓库
3. 您的 Netlify 网站已部署并运行

## 步骤 1: 准备代码仓库

1. 确保您的项目代码已提交到 GitHub 仓库。
2. 确保您的仓库中包含以下文件：
   - `server.js` - 后端服务器代码
   - `package.json` - 项目依赖和脚本
   - `render.yaml` - Render 部署配置
   - `.gitignore` - Git 忽略文件配置

## 步骤 2: 创建 Render 账户

1. 访问 https://render.com/
2. 点击 "Sign Up" 创建账户
3. 使用您的 GitHub 账户登录（推荐）
4. 授权 Render 访问您的 GitHub 仓库

## 步骤 3: 创建新的 Web Service

1. 登录 Render 后，点击 "New +" 按钮
2. 选择 "Web Service"
3. 在 "Connect a repository" 部分，选择您的 GitHub 仓库
4. 如果是第一次使用 Render，您可能需要授权 Render 访问您的 GitHub 仓库

## 步骤 4: 配置 Web Service

### 基本信息

1. **Name**: 输入服务名称，例如 `interpretive-friction-backend`
2. **Region**: 选择离您最近的区域
3. **Branch**: 选择 `main` 或 `master` 分支

### 构建和运行配置

1. **Runtime**: 选择 `Node`
2. **Build Command**: 输入 `npm install`
3. **Start Command**: 输入 `node server.js`

### 环境变量

在 "Environment Variables" 部分，添加以下变量：

1. `RECORDING_PORT` = `10000`
   - Render 会自动将此端口暴露给外部
2. `ALLOWED_ORIGIN` = `https://vermillion-cheesecake-29e6d1.netlify.app/`
   - 替换为您的 Netlify 网站域名

### 持久化存储

1. 在 "Advanced" 部分，找到 "Disk" 选项
2. 点击 "Add Disk"
3. 配置如下：
   - **Name**: `data`
   - **Mount Path**: `/opt/render/project/data`
   - **Size**: `1 GB`（免费账户限制）
4. 点击 "Save"

## 步骤 5: 部署应用

1. 点击 "Create Web Service" 按钮
2. 等待 Render 构建和部署您的应用
3. 部署完成后，Render 会为您的应用分配一个 URL，例如：
   - `https://interpretive-friction-backend.onrender.com`

## 步骤 6: 获取后端 URL

1. 在 Render 仪表板中，找到您刚创建的 Web Service
2. 复制分配给您的应用的 URL
3. 这个 URL 就是您的后端 API 基础 URL

## 步骤 7: 配置 Netlify 连接到 Render 后端

1. 登录到 Netlify 并打开您的项目
2. 进入 "Site settings" -> "Environment variables"
3. 添加以下环境变量：
   - `VITE_RECORDING_API_BASE_URL` = `https://your-backend-url.onrender.com/api`
     - 替换 `your-backend-url.onrender.com` 为您在 Render 上获取的实际 URL
4. 保存更改

## 步骤 8: 重新部署 Netlify 网站

1. 在 Netlify 仪表板中，找到您的网站
2. 点击 "Deploys" 标签
3. 点击 "Trigger deploy" -> "Deploy site"
4. 等待部署完成

## 步骤 9: 验证部署

1. 访问您的 Netlify 网站
2. 打开浏览器控制台（F12），切换到 "Console" 标签
3. 使用应用程序，完成一次完整的会话
4. 检查控制台是否有任何 API 错误
5. 访问 `https://your-backend-url.onrender.com/api/health`，应该返回 `{"ok":true}`
6. 访问 `https://your-backend-url.onrender.com/api/export?format=json`，应该返回记录的数据

## 常见问题

### Q: 部署后无法连接到后端

A: 检查以下几点：
1. 确保 `VITE_RECORDING_API_BASE_URL` 环境变量设置正确
2. 确保 `ALLOWED_ORIGIN` 环境变量包含您的 Netlify 域名
3. 检查 Render 上的服务是否正在运行
4. 查看浏览器控制台和 Render 日志中的错误信息

### Q: 数据没有保存到数据库

A: 检查以下几点：
1. 确保在 Render 上配置了持久化磁盘
2. 检查磁盘挂载路径是否正确
3. 查看服务器日志，看是否有数据库错误

### Q: 如何查看服务器日志？

A: 在 Render 仪表板中：
1. 找到您的 Web Service
2. 点击 "Logs" 标签
3. 查看实时日志或历史日志

### Q: 如何更新后端代码？

A: 当您推送新代码到 GitHub 仓库后：
1. Render 会自动检测到更改并开始重新部署
2. 您也可以在 Render 仪表板中手动触发重新部署
3. 等待部署完成后，新代码就会生效

## 总结

通过以上步骤，您应该能够成功将后端部署到 Render，并配置 Netlify 连接到它。这样，您的 Netlify 网站就可以将数据记录到 Render 上的后端服务器了。

如果您在部署过程中遇到任何问题，可以参考 Render 的官方文档：https://render.com/docs
