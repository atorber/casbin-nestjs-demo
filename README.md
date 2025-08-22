# Casbin 权限管理演示项目

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/NestJS-8.x-red.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-13.x-black.svg)](https://nextjs.org/)
[![Casbin](https://img.shields.io/badge/Casbin-5.x-blue.svg)](https://casbin.org/)

一个使用 NestJS、Next.js 和 Casbin 展示基于角色的访问控制（RBAC）的全栈演示应用。本项目演示了如何在现代 Web 应用中实现安全的基于角色的授权。

## 功能特性

- 🔐 使用 Casbin 的基于角色的访问控制（RBAC）
- 🔑 JWT 身份验证
- 👤 用户管理
- 📱 使用 Shadcn/UI 的响应式界面
- 📚 使用 Swagger 的 API 文档
- 🔄 实时权限更新
- 🎯 TypeScript 支持

## 项目结构

```
.
├── api/                # NestJS 后端
│   ├── src/
│   │   ├── auth/      # 身份验证模块
│   │   ├── users/     # 用户管理
│   │   └── casbinconfig/ # Casbin 配置
│   └── package.json
│
└── web/               # Next.js 前端
    ├── src/
    │   ├── app/       # Next.js App 路由
    │   ├── components/# React 组件
    │   └── lib/       # 工具库
    └── package.json
```

## 环境要求

- Node.js（v18.x 或更高版本）
- npm（v10.x 或更高版本）
- SQLite（已包含）

## 快速开始

1. 克隆仓库：
```bash
git clone <repository-url>
cd casbindemo
```

2. 安装依赖：
```bash
# 安装 API 依赖
cd api
npm install

# 安装 Web 依赖
cd ../web
npm install
```

3. 配置环境变量：
```bash
# 在 api/.env 文件中
PORT=8000
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h

# 在 web/.env 文件中
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. 创建初始用户：
```bash
cd api
npm run create:users
```

5. 启动开发服务器：
```bash
# 启动 API 服务器（在 api 目录中）
npm run start:dev

# 启动 Web 服务器（在 web 目录中）
npm run dev
```

6. 访问应用：
- 前端：http://localhost:8001
- API 文档：http://localhost:8000/api-docs

## 默认用户

应用程序预配置了以下用户：

| 用户名 | 密码      | 角色  |
|--------|-----------|-------|
| admin  | Admin123! | admin |
| user   | User123!  | user  |
| demo   | Demo123!  | user  |

## API 文档

API 文档可通过 Swagger UI 访问：http://localhost:8000/api-docs。提供以下功能：
- 详细的端点文档
- 请求/响应模式
- 身份验证要求
- 交互式 API 测试界面

## 开发

### API（NestJS）

```bash
cd api

# 以开发模式运行
npm run start:dev

# 运行测试
npm run test

# 构建生产版本
npm run build
```

### Web（Next.js）

```bash
cd web

# 以开发模式运行
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

本项目采用 MIT 许可证 - 详情请见 [LICENSE](LICENSE) 文件。

### 依赖许可证概览

本项目使用以下主要依赖及其许可证：

- NestJS（MIT 许可证）
- Next.js（MIT 许可证）
- Casbin（Apache 2.0 许可证）
- React（MIT 许可证）
- TypeORM（MIT 许可证）
- SQLite（公共领域）
- Shadcn/UI（MIT 许可证）
- Radix UI（MIT 许可证）
- Tailwind CSS（MIT 许可证）

所有依赖项都与 MIT 许可证条款兼容。 