import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserDto {
  @IsNumber()
  @ApiProperty({ name: 'id' })
  @Expose({ name: 'id', toClassOnly: true })
  id: number;

  @IsString()
  @ApiProperty({ name: 'firstName' })
  @Expose({ name: 'first_name', toPlainOnly: true })
  firstName: string;

  @IsString()
  @ApiProperty({ name: 'lastName' })
  @Expose({ name: 'last_name', toPlainOnly: true })
  lastName: string;

  @IsEmail()
  @ApiProperty({ name: 'email' })
  @Expose({ name: 'email', toClassOnly: true })
  email: string;

  @IsBoolean()
  @ApiProperty({ name: 'isVerified' })
  @Expose({ name: 'is_verified', toPlainOnly: true })
  isVerified: boolean;

  @IsString()
  @ApiProperty({ name: 'password' })
  @Expose({ name: 'password', toPlainOnly: true })
  password: string;
}

export class UserCreatePayload {
  @IsString()
  @Expose({ name: 'first_name', toPlainOnly: true })
  @ApiProperty({ name: 'firstName' })
  firstName: string;

  @IsString()
  @Expose({ name: 'last_name', toPlainOnly: true })
  @ApiProperty({ name: 'lastName' })
  lastName: string;

  @IsEmail({}, { message: 'Enter valid email address' })
  @ApiProperty({ name: 'email' })
  @Transform((params: TransformFnParams) => params.value.toLowerCase())
  @Expose({ name: 'email', toPlainOnly: true })
  email: string;

  @IsString()
  @MinLength(5)
  @MaxLength(15)
  @Expose({ name: 'password', toPlainOnly: true })
  @ApiProperty({ name: 'password' })
  password: string;
}

export class UserLoginPayload {
  @IsEmail({}, { message: 'Enter valid email address' })
  @ApiProperty({ name: 'email' })
  @Transform((params: TransformFnParams) => params.value.toLowerCase())
  @Expose({ name: 'email', toPlainOnly: true })
  email: string;

  @IsString()
  @MinLength(5)
  @Expose({ name: 'password', toPlainOnly: true })
  @ApiProperty({ name: 'password' })
  password: string;
}
