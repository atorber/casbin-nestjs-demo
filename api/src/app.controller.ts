import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

export class HelloWorldResponse {
  message: string;
  timestamp: string;
}

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get hello world message' })
  @ApiResponse({
    status: 200,
    description: 'Returns a hello world message with timestamp',
    type: HelloWorldResponse,
  })
  getHello(): HelloWorldResponse {
    return this.appService.getHello();
  }
}
