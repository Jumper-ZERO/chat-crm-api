import { IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUUID } from "class-validator";
import { isUnique } from "../../../utils/validators";
import { ContactSource, CustomerStatus } from "../contact.enum";

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @isUnique({ tableName: 'contacts', column: 'phone' })
  @IsPhoneNumber('PE')
  phone: string;

  @IsOptional()
  @IsEnum(CustomerStatus)
  customerStatus?: CustomerStatus;

  @IsOptional()
  @IsEnum(ContactSource)
  source?: ContactSource;

  @IsOptional()
  @IsUUID()
  assignedTo?: string; // Optional field for assigning to a user
}