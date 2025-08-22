import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

export class HelloWorldResponse {
  message: string;
  timestamp: string;
}

@ApiTags('应用')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '获取欢迎消息' })
  @ApiResponse({
    status: 200,
    description: '返回带有时间戳的欢迎消息',
    type: HelloWorldResponse,
  })
  getHello(): HelloWorldResponse {
    return this.appService.getHello();
  }
}
