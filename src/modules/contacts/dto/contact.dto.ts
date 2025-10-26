import { createZodDto } from "nestjs-zod";
import { ContactSchema } from "../contact.schema";

export class CreateContactDto extends createZodDto(
  ContactSchema.omit({ id: true })
) { }

export class UpdateContactDto extends createZodDto(
  ContactSchema.partial().omit({ id: true })
) { }

export class ContactResponseDto extends createZodDto(ContactSchema) { }