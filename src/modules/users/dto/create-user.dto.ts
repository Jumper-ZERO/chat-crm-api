import { isUnique } from '@utils/validators';
import { IsBoolean, IsEnum, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { i18nValidationMessage as t } from "nestjs-i18n";
import { UserRole } from "src/modules/users/entities/user.entity";

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

  @IsEnum(UserRole, { message: t('validations.role', { values: 'admin or user' }) })
  role: UserRole

  @IsBoolean({ message: t('validations.invalid.boolean', { attr: 'isActive' }) })
  @IsOptional()
  isActive: boolean;
}
