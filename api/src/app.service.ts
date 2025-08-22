import { Injectable } from '@nestjs/common';
import { HelloWorldResponse } from './app.controller';

@Injectable()
export class AppService {
  getHello(): HelloWorldResponse {
    return {
      message: '欢迎使用 Casbin 权限管理系统！',
      timestamp: new Date().toISOString(),
    };
  }
}
