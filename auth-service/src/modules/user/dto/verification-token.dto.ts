import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerificationTokenDto {
  @IsEmail({}, { message: 'Enter valid email address' })
  @IsString()
  @ApiProperty({ name: 'email' })
  email: string;
}
