import { PartialType } from "@nestjs/mapped-types";
import { CreateClientDetailsDto } from "src/modules/clients/dto/create-client-details.dto";

export class UpdateClientDetailsDto extends PartialType(CreateClientDetailsDto) { }