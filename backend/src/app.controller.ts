import { Controller, Get } from '@nestjs/common';

interface HealthResponse {
  status: string;
  application: string;
}

@Controller()
export class AppController {
  @Get()
  getHome(): string {
    return 'Roxy API';
  }

  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'online',
      application: 'Roxy API',
    };
  }
}