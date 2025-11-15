import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {

  constructor(private schema: ZodType) { }

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      const validatedObject = this.schema.parse(value);
      return validatedObject;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: error.issues,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}