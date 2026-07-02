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

启动服务时会自动初始化 SQLite 数据库：

```text
../data/doneyet.sqlite
```

当前已创建表：

- `meals`
- `meal_items`
- `workouts`
- `workout_items`
- `body_records`
- `app_settings`

## 后续计划

- 实现饮食、训练、身体数据和统计 API
- 前端从 `localStorage` 切换到 `/api` 数据源
