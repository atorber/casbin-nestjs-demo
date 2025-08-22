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

# 运行测试
npm run test
```

## 项目结构

```
src/
├── auth/              # 认证模块
├── users/             # 用户管理模块
├── casbinconfig/      # Casbin 配置
├── config/            # 应用配置
└── main.ts           # 应用入口点
```

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](../LICENSE) 文件。
