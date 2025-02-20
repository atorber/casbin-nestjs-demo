import { Injectable } from '@nestjs/common';
import { HelloWorldResponse } from './app.controller';

@Injectable()
export class AppService {
  getHello(): HelloWorldResponse {
    return {
      message: 'Hello World!',
      timestamp: new Date().toISOString(),
    };
  }
}
