// 测试环境设置
import 'reflect-metadata';

// 全局测试配置
beforeAll(() => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // 清理测试环境
});

// 模拟console方法以避免测试输出
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
