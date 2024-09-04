import { UnauthorizedException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class UserDetails {
  @IsString()
  @Expose({ name: 'first_name', toPlainOnly: true })
  @ApiProperty({ name: 'firstName' })
  firstName: string;

  @IsString()
  @Expose({ name: 'last_name', toPlainOnly: true })
  @ApiProperty({ name: 'lastName' })
  lastName: string;

  @IsEmail()
  @ApiProperty({ name: 'email' })
  @Transform((params: TransformFnParams) => params.value.toLowerCase())
  @Expose({ name: 'email', toPlainOnly: true })
  email: string;
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

  @IsEmail()
  @ApiProperty({ name: 'email' })
  @Transform((params: TransformFnParams) => params.value.toLowerCase())
  @Expose({ name: 'email', toPlainOnly: true })
  email: string;

  @IsString()
  @MinLength(5)
  @Expose({ name: 'password', toPlainOnly: true })
  @ApiProperty({ name: 'password' })
  password: string;

  @IsString()
  @MinLength(5)
  @Expose({ name: 'confirm_password', toClassOnly: true })
  @ApiProperty({ name: 'confirmPassword' })
  @Transform((params: TransformFnParams) => {
    if (params?.value !== params?.obj?.password) {
      throw new UnauthorizedException(`password doesn't match`);
    }
    return params.value;
  })
  confirmPassword: string;
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
