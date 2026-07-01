# DoneYet

DoneYet 是一个本地优先的个人健康记录 Web 应用，用于记录每日饮食、训练和身体指标变化。

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
- 顶部品牌区使用由像素块拼出的无底 `DoneYet` 标识，日期显示在标识下方。
- 顶部基础代谢卡片支持独立修改，不再与身体指标记录同步。
- 饮食和健身模块保留共享日期选择，切换任一模块日期后另一个模块保持同步。
- 身体数据模块通过“添加数据”弹出编辑卡片录入，支持体重、胸围、腰围、体脂和日期。
- 身体数据折线图根据记录绘制，点击图表数据点可进入修改。
- 身体数据折线图下方保留月度完成日历，用绿色、蓝色、红色图标表示当天完成情况。
- `server/` 和 `data/` 已预留，后续接入 SQLite 后，身体数据将通过 API 写入数据库。

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

身体数据相关接口预留：

- `GET /api/body-records`
- `POST /api/body-records`
- `PATCH /api/body-records/:id`
- `DELETE /api/body-records/:id`
- `GET /api/settings/bmr`
- `PATCH /api/settings/bmr`
