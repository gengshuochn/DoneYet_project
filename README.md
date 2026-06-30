# DoneYet

DoneYet 是一个本地优先的个人健康记录 Web 应用，用于记录每日饮食、训练和身体数据。

## 项目结构

```text
DoneYet_project/
  client/        # 前端：React + TypeScript + Vite
  server/        # 后端：预留 Node.js + Express + SQLite
  data/          # SQLite 数据库目录，后续存放 doneyet.sqlite
  package.json   # 根目录统一脚本
  README.md
```

## 当前状态

- `client/` 已实现桌面端前端原型。
- `server/` 已预留目录，后续实现本地 API。
- `data/` 已预留目录，后续存放 SQLite 数据库文件。

## 启动前端

```bash
npm install --prefix client
npm run client:dev
```

默认访问：

```text
http://localhost:5173
```

## 构建前端

```bash
npm run client:build
```

## 后端预留

前端已在 `client/src/api/client.ts` 中预留接口调用，Vite 开发服务器会把 `/api` 代理到：

```text
http://localhost:3001
```

后续后端建议使用 Node.js + Express + SQLite，并监听 `0.0.0.0:3001`，便于通过局域网或 Tailscale 访问。
