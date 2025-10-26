import { isUnique } from '@utils/validators';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MinLength } from "class-validator";
import { i18nValidationMessage as t } from "nestjs-i18n";
import type { UserRole } from "src/modules/users/entities/user.entity";
import { IsInDatabase } from '../../../utils/validators/IsInDatabase';
import { Company } from '../../companies/entities/company.entity';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: t('validations.username'),
  })
  @isUnique({ tableName: 'users', column: 'username' })
  username: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  role: UserRole

  @IsBoolean({ message: t('validations.invalid.boolean', { attr: 'isActive' }) })
  @IsOptional()
  isActive: boolean;

  @IsUUID()
  @IsNotEmpty()
  @IsInDatabase(Company, 'id')
  companyId: string;
}
