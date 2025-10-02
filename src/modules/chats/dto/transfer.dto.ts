import { createZodDto } from "nestjs-zod";
import { TransferSchema } from "../schemas/transfer.schema";

export class TransferDto extends createZodDto(
  TransferSchema.omit({ id: true, createdAt: true })
) { }

export class TransferResponseDto extends createZodDto(TransferSchema) { }