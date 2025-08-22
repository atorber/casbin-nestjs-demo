# NestJS Casbin 权限管理演示 API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

这是一个演示应用，展示 NestJS 和 Casbin 集成实现基于角色的访问控制（RBAC）。该应用提供 RESTful API 和 OpenAPI (Swagger) 文档。

## 功能特性

- 🔐 基于 Casbin 的角色访问控制
- 🔑 JWT 身份认证
- 📚 OpenAPI (Swagger) 文档
- ✨ 输入验证
- 🎯 TypeScript 支持
- 🔄 实时权限更新
- 🧪 完整的单元测试覆盖
- 📊 存储管理系统（实例、路径、权限）
- 👥 用户和角色管理
- 🔍 批量权限操作支持

## 前置要求

- Node.js (v18.x 或更高版本)
- npm (v10.x 或更高版本)
- SQLite (已包含)

## 安装

1. 安装依赖：
```bash
npm install
```

2. 复制 `.env.example` 文件到 `.env` 并更新值：
```bash
cp .env.example .env
```

## 运行应用

### 开发模式
```bash
npm run start:dev
```

### 生产模式
```bash
npm run build
npm run start:prod
```

## API 文档

应用运行后，您可以在以下地址访问 Swagger 文档：
http://localhost:8000/api-docs

## 可用脚本

```bash
# 开发
npm run start:dev

# 构建
npm run build

# 生产
npm run start:prod

# 创建初始用户
npm run create:users

# 测试
npm run test

# 测试覆盖率
npm run test:cov

# 监听模式测试
npm run test:watch

# 调试测试
npm run test:debug

# 端到端测试
npm run test:e2e
```

## 🧪 测试

本项目包含完整的单元测试覆盖，确保代码质量和功能正确性。

### 测试覆盖模块

- **存储模块** (`src/storage/`) - 存储实例、路径和权限管理
- **用户模块** (`src/users/`) - 用户CRUD操作和角色管理
- **认证模块** (`src/auth/`) - 用户注册、登录和JWT处理
- **应用模块** (`src/app.controller.ts`) - 基本应用控制器

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定模块测试
npm test -- --testPathPattern=storage
npm test -- --testPathPattern=users
npm test -- --testPathPattern=auth

# 运行单个测试文件
npm test -- --testPathPattern=app.controller.spec.ts

# 生成测试覆盖率报告
npm run test:cov

# 监听模式运行测试（开发时使用）
npm run test:watch

# 调试模式运行测试
npm run test:debug
```

### 测试统计

- **测试文件**: 7个
- **测试用例**: 50+个
- **覆盖率**: 包含正常流程和异常情况
- **测试类型**: 单元测试、Mock测试

### 测试最佳实践

- 使用Jest作为测试框架
- Mock外部依赖（数据库、服务等）
- 测试覆盖成功和失败场景
- 保持测试独立性和可重复性

## 项目结构

```
src/
├── auth/              # 认证模块
│   ├── *.spec.ts     # 认证模块测试
├── users/             # 用户管理模块
│   ├── *.spec.ts     # 用户模块测试
├── storage/           # 存储管理模块
│   ├── *.spec.ts     # 存储模块测试
├── casbinconfig/      # Casbin 配置
├── config/            # 应用配置
├── scripts/           # 数据初始化脚本
└── main.ts           # 应用入口点
test/
├── setup.ts          # 测试环境设置
└── jest-e2e.json     # 端到端测试配置
```

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](../LICENSE) 文件。
