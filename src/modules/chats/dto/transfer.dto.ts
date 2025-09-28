import { PartialType } from "@nestjs/mapped-types";

export class TransferDto {
  transferredAt?: Date;
}

export class UpdateChatDto extends PartialType(TransferDto) { }