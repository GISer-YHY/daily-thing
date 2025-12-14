# Daily PhD & Sales Tracker (每日进阶)

这是一个为博士备考与销售工作量身定制的每日打卡与记录应用。前端使用 React 构建，后端使用 Node.js + Express，数据库采用 MySQL。

## 项目结构

*   **/**: 前端代码 (React)
*   **/server**: 后端 API 代码 (Node.js)
*   **/server/schema.sql**: 数据库建表语句

## 快速开始

### 1. 后端部署 (Server)

确保您的服务器上安装了 Node.js 和 MySQL。

1.  进入 server 目录:
    ```bash
    cd server
    ```
2.  安装依赖:
    ```bash
    npm install
    ```
3.  配置环境变量:
    创建一个 `.env` 文件在 `server/` 目录下，填入您的数据库信息:
    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=userdb
    PORT=3000
    ```
4.  启动服务器:
    ```bash
    node index.js
    ```

### 2. 前端运行 (Frontend)

本项目前端默认通过 `/api` 访问后端。

* 在 **Netlify 部署** 时，`/api/*` 由 Netlify Functions 提供，并默认把数据存到 Netlify Blobs（这不会写入云服务器的 MySQL `userdb.daily_logs`）。
* 如果希望写入 **云服务器上的 MySQL**，需要把前端请求指向自建后端（Server）。

1.  确保 `services/storageService.ts` 中的 `API_BASE_URL` 指向您的服务器 IP 地址。
    - 推荐方式：在构建环境里设置 `VITE_API_BASE_URL`，例如 `http://<server-ip>:3000/api`（无需改代码）。
2.  使用任意静态文件服务器运行根目录。例如:
    ```bash
    npx serve .
    ```
3.  在浏览器访问 `http://localhost:3000` (取决于 serve 的端口)。

## 数据库结构

请参考 `server/schema.sql` 在 MySQL 中创建 `daily_logs` 表。

## 主要功能

*   每日任务清单管理
*   任务状态打卡 (完成/未完成)
*   详细内容/备注记录
*   数据自动同步至云端 MySQL 数据库
*   按日期查看历史记录

---
*Created for the ambitious soul balancing Sales and Academia. Last Updated: 2024.*
