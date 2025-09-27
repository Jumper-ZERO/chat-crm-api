import { IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUUID } from "class-validator";
// import { isUnique } from "../../../utils/validators";
import { ContactStatus } from "../contact.enum";

export class CreateContactDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @IsOptional()
  name: string;

  // @isUnique({ tableName: 'contacts', column: 'phone' })
  @IsPhoneNumber('PE')
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @IsOptional()
  @IsUUID()
  assignedTo?: string; // Optional field for assigning to a user
}