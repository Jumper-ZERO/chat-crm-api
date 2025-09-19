import { isUnique } from '@utils/validators';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MinLength } from "class-validator";
import { i18nValidationMessage as t } from "nestjs-i18n";
import { UserRole } from "src/modules/users/entities/user.entity";
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
  @MinLength(8, {
    message: t('validations.min', { campo: 'password', min: 8 }),
  })
  password: string;

  @IsEnum(UserRole)
  role: UserRole

  @IsBoolean({ message: t('validations.invalid.boolean', { attr: 'isActive' }) })
  @IsOptional()
  isActive: boolean;

  @IsUUID()
  @IsNotEmpty()
  @IsInDatabase(Company, 'id')
  companyId: string;
}
