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
- 身体数据折线图默认显示体重，支持切换单一指标类型，不再多指标挤在同一张图。
- 折线图点位可连续点击修改，保存后本地状态和图表立即更新。
- 折线图纵轴根据当前指标数据范围自动计算，并预留上下边界。
- 折线图支持独立的起始/终止时间范围选择，不影响完成日历。
- 身体数据折线图下方保留月度完成日历，年份和月份通过数字卡片弹出编辑。
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
