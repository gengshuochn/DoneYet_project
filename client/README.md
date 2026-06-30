# DoneYet Client

DoneYet 的桌面端前端应用，使用 React + TypeScript + Vite 构建。

## 当前前端交互

- 顶部使用无底像素风 `DoneYet` 标识，日期显示在标识下方。
- 顶部基础代谢卡片可独立修改 BMR。
- 饮食模块支持卡片和食物条目编辑，并实时汇总营养。
- 训练模块支持训练卡片、动作条目、训练时长和热量消耗。
- 身体数据模块通过弹出编辑卡片添加体重、胸围、腰围、体脂记录。
- 身体数据折线图根据记录绘制，点击图表点可修改对应记录。

## 启动

```bash
npm install
npm run dev
```

默认地址：

```text
http://localhost:5173
```

前端已预留 `/api -> http://localhost:3001` 代理，后端完成后可直接对接 `src/api/client.ts` 中定义的接口。
