import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MetricsService } from './metrics.service';

@Controller('metrics')
@UseGuards(AuthGuard('jwt'))
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) { }

  @Get("KPIs")
  @HttpCode(HttpStatus.OK)
  async getKpis() {
    const metrics = this.metricsService.kpis();
    return metrics;
  }
}
