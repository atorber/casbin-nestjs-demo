# Next.js Casbin 权限管理演示前端

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Casbin 演示项目的前端应用，使用 Next.js 构建，具有现代化的响应式 UI 和基于角色的访问控制。

## 功能特性

- 🎨 使用 Shadcn/UI 的现代化界面
- 🔐 基于角色的访问控制
- 📱 响应式设计
- 🔑 JWT 身份认证
- 🎯 TypeScript 支持
- ⚡ 快速刷新
- 🎨 Tailwind CSS

## 前置要求

- Node.js (v18.x 或更高版本)
- npm (v10.x 或更高版本)

## 开始使用

1. 安装依赖：
```bash
npm install
```

2. 设置环境变量：
```bash
# 复制示例环境文件
cp .env.example .env

# 更新为您的 API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. 启动开发服务器：
```bash
npm run dev
```

应用将在 http://localhost:8001 可用

## 可用脚本

```bash
# 开发
npm run dev

# 构建
npm run build

# 生产
npm start

# 代码检查
npm run lint
```

## 项目结构

```
src/
├── app/                # Next.js App Router
├── components/         # React 组件
│   ├── ui/            # Shadcn UI 组件
│   ├── auth/          # 认证组件
│   └── users/         # 用户管理组件
├── contexts/          # React Contexts
├── lib/               # 工具和 API 客户端
└── styles/            # 全局样式
```

## 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `NEXT_PUBLIC_API_URL` | 后端 API URL | http://localhost:8000 |
| `PORT` | 前端端口 | 8001 |

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](../LICENSE) 文件。 