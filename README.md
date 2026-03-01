# CS26 2D Structure Design MVP (Code Foundation)

本仓库基于《二维结构设计与成本估算系统毕业设计版技术实现文档》持续开发，当前已实现“项目创建 → 设计版本保存 → 估价 → 估价记录查询 → HTML 报告生成/查询”的可测试后端核心流程（内存存储版）。

## 当前能力

- 严格类型化的几何与估价领域模型（TypeScript strict mode）。
- Polygon 面积/周长计算（shoelace + perimeter）。
- 估价引擎（材料 + 人工）与金额舍入策略。
- API 层请求校验（Zod，按接口单独 schema）与统一错误返回。
- 项目流程服务：
  - 创建项目
  - 保存版本（自动计算工程量）
  - 基于项目版本执行估价
  - 查询项目估价历史
- 基础权限控制：仅项目 owner 可保存版本/执行估价/生成报告。
- 估价快照持久化（价格与厚度参数）用于追溯。
- 报告能力：根据估价记录生成 HTML 报告，并要求 owner 权限进行 report 查询。
- 单元测试与流程测试（Vitest）。

## 项目结构

```text
src/
  api/
    estimate-route.ts        # 独立估价请求示例
    project-routes.ts        # 项目流程 API（含显式payload校验与错误映射）
    report-routes.ts         # 报告生成与查询 API
  application/
    estimate-engine.ts       # 估价业务逻辑
    project-service.ts       # 项目流程应用服务
    report-service.ts        # 报告业务逻辑
  domain/
    estimate.ts              # 估价记录模型
    report.ts                # 报告记录模型
    geometry.ts              # 几何计算与解析
    project.ts               # 项目与版本领域模型
    types.ts                 # 估价领域类型定义
  infrastructure/
    in-memory-store.ts       # 内存存储与仓储抽象（MVP阶段）
  shared/
    id.ts                    # 简单 ID 生成
tests/
  geometry.test.ts
  estimate-engine.test.ts
  estimate-route.test.ts
  project-service.test.ts
  project-routes.test.ts
  report-service.test.ts
  report-routes.test.ts
```

## 本地运行

```bash
npm install
npm run lint
npm run test
npm run build
```

## 后续计划（下一迭代）

1. 将 `src/api/project-routes.ts` 对接 Next.js `app/api/.../route.ts`。
2. 用 Payload + Postgres 替换内存仓储实现。
3. 增加角色模型（admin）与更细粒度 Access Control。
4. 增加价格表版本实体并绑定估价快照。
5. 增加 Playwright E2E：登录→创建项目→绘制→保存版本→估价→导出。
