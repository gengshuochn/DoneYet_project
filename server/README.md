# DoneYet Server

DoneYet 后端 API，使用 Node.js + TypeScript + Express。

## 启动

```bash
npm install
npm run dev
```

默认监听：

```text
http://localhost:3001
```

为了后续局域网或 Tailscale 访问，开发环境默认监听 `0.0.0.0`。

## 当前接口

```text
GET /api/health
```

## 后续计划

- 接入 SQLite，数据库文件放在 `../data/doneyet.sqlite`
- 实现饮食、训练、身体数据和统计 API
- 前端从 `localStorage` 切换到 `/api` 数据源
