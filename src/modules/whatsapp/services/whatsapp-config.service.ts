import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { AxiosError } from 'axios';
import { PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';

import { CreateWhatsAppConfigDto, UpdateWhatsAppConfigDto } from '../dto/whatsapp-config.dto';
import { WhatsAppConfig } from '../entities/whatsapp-config.entity';

interface FacebookError {
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

@Injectable()
export class WhatsAppConfigService {
  constructor(
    @InjectRepository(WhatsAppConfig)
    private configRepository: Repository<WhatsAppConfig>,
    private readonly http: HttpService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(WhatsAppConfigService.name)
  }

  async create(createDto: CreateWhatsAppConfigDto): Promise<WhatsAppConfig> {
    const config = this.configRepository.create(createDto);
    return await this.configRepository.save(config);
  }

  async getConfigActive(): Promise<WhatsAppConfig | null> {
    const config = this.configRepository.findOne({
      where: { isActive: true }
    });

    return config;
  }

  async findByBusinessIdActive(): Promise<string | undefined> {
    const config = await this.configRepository.findOne({
      where: { isActive: true }
    });

    return config?.businessId;
  }

  async findByBusinessId(businessId: string): Promise<WhatsAppConfig> {
    const config = await this.configRepository.findOne({
      where: { businessId, isActive: true }
    });

    if (!config) {
      throw new NotFoundException('WhatsApp configuration not found');
    }

    return config;
  }

  async updateByBusinessId(businessId: string, dto: UpdateWhatsAppConfigDto): Promise<WhatsAppConfig | null> {
    const config = await this.configRepository.findOne({
      where: { businessId }
    });

    if (!config?.id) return null
    await this.configRepository.update(config?.id, dto);

    return config;
  }

  async update(id: string, updateDto: UpdateWhatsAppConfigDto): Promise<WhatsAppConfig | null> {
    await this.configRepository.update(id, updateDto);
    return await this.configRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.configRepository.update(id, { isActive: false });
  }

  async testConnection(businessId: string): Promise<boolean> {
    const config = await this.findByBusinessId(businessId);

    if (!this.isValidConfig(config)) {
      this.logger.warn(`Invalid configuration for businessId: ${businessId}`);
      return false;
    }

    const url = this.buildApiUrl(config);

    try {
      const response = await this.http.axiosRef(url, {
        headers: this.buildAuthHeaders(config.accessToken),
      });

      const isSuccess = response.status === 200;
      this.logger.info(`Response status for businessId ${businessId}: ${response.status}`);
      this.logger.info(`Connection ${isSuccess ? 'successful' : 'failed'} for businessId: ${businessId}`);
      return isSuccess;
    } catch (error) {
      const err = error as AxiosError

      const data = err.response?.data as { error: FacebookError }
      const message = data.error?.message;
      const type = data.error?.type ?? 'Unknown';

      this.logger.error(`Error testing WhatsApp connection for businessId: ${businessId}`, error);
      this.logger.error(`WhatsApp connection failed [${type}] for businessId: ${businessId}\n\t${message}\n\n`);

      return false;
    }
  }

  private isValidConfig(config: Partial<WhatsAppConfig>): boolean {
    return !!(config?.apiBaseUrl && config?.apiVersion && config?.phoneNumberId && config?.accessToken);
  }

  private buildApiUrl(config: WhatsAppConfig): string {
    return `${config.apiBaseUrl}/${config.apiVersion}/${config.phoneNumberId}`;
  }

  private buildAuthHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}