import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PasswordResetTypeEnum } from 'src/common/enum/password-reset-type.enum';

export class PasswordResetDto {
  @IsOptional()
  @IsNumber()
  @Expose({ name: 'id', toClassOnly: true })
  id: number;

  @IsNumber()
  @Expose({ name: 'user_id', toPlainOnly: true })
  userId: number;

  @IsString()
  @Expose({ name: 'token', toPlainOnly: true })
  token: string;

  @IsBoolean()
  @Expose({ name: 'is_used', toPlainOnly: true })
  isUsed: boolean;

  @ApiProperty({
    name: 'type',
    enum: PasswordResetTypeEnum,
    required: false,
    default: PasswordResetTypeEnum.VERIFY_ACCOUNT,
  })
  @Expose({ name: 'type', toPlainOnly: true })
  @IsEnum(PasswordResetTypeEnum)
  type: PasswordResetTypeEnum;
}

export class ChangePasswordDto {
  @IsString()
  @ApiProperty({ name: 'token' })
  @Expose({ name: 'token', toPlainOnly: true })
  token: string;

  @IsString()
  @MinLength(5)
  @MaxLength(15)
  @Expose({ name: 'password', toPlainOnly: true })
  @ApiProperty({ name: 'password' })
  password: string;
}
