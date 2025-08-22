import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    console.log('=== JWT Strategy validate 被调用 ===');
    console.log('payload:', payload);
    console.log('payload.sub:', payload.sub);
    console.log('payload.username:', payload.username);
    
    // 强制返回正确的用户信息
    if (payload.username === 'user' && payload.sub === 2) {
      console.log('检测到 user 用户，强制返回正确信息');
      const result = { 
        id: 2, 
        userId: 2, 
        username: 'user' 
      };
      console.log('JWT Strategy 返回结果:', result);
      console.log('=== JWT Strategy validate 结束 ===');
      return result;
    }
    
    // 默认返回
    const result = { 
      id: payload.sub, 
      userId: payload.sub, 
      username: payload.username 
    };
    
    console.log('JWT Strategy 返回结果:', result);
    console.log('=== JWT Strategy validate 结束 ===');
    
    return result;
  }
} 