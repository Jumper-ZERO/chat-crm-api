import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
      throw new BadRequestException(`Invalid configuration for businessId: ${businessId}`);
    }

    const url = this.buildApiUrl(config);

    return this.http.axiosRef(url, {
      headers: this.buildAuthHeaders(config.accessToken),
    }).then((res) => {
      if (res.status != (HttpStatus.OK as number)) {
        throw new InternalServerErrorException('WhatsApp API returned unexpected status');
      }
      return true;
    }).catch((err: AxiosError) => {
      const data = err.response?.data as { error?: FacebookError };
      const message = data?.error?.message ?? 'Unexpected error';
      const type = data?.error?.type ?? 'Unknown';

      throw new HttpException(
        {
          success: false,
          statusCode: err.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          error: type,
          message,
        },
        err.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    })
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