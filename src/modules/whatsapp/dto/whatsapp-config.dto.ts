import { IsArray, IsBoolean, IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class CreateWhatsAppConfigDto {
  @IsString()
  businessId: string;

  @IsString()
  accessToken: string;

  @IsString()
  phoneNumberId: string;

  @IsString()
  webhookUrl: string;

  @IsString()
  verifyToken: string;

  @IsOptional()
  @Matches(/^v\d{2}\.\d$/)
  apiVersion: string;

  @IsOptional()
  @IsUrl()
  apiBaseUrl: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessDescription?: string;

  @IsOptional()
  @IsArray()
  webhookEvents?: string[];
}

export class UpdateWhatsAppConfigDto {
  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  phoneNumberId?: string;

  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @IsOptional()
  @IsString()
  verifyToken?: string;

  @IsOptional()
  @Matches(/^v\d{2}\.\d$/)
  apiVersion?: string;

  @IsOptional()
  @IsUrl()
  apiBaseUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessDescription?: string;

  @IsOptional()
  @IsArray()
  webhookEvents?: string[];
}