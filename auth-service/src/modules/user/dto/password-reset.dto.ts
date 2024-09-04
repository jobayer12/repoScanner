import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { PasswordResetTypeEnum } from 'src/common/enum/password-reset-type.enum';

export class PasswordResetDto {
  @IsNumber()
  @Expose({ name: 'id' })
  id: number;

  @IsNumber()
  @Expose({ name: 'user_id', toPlainOnly: true })
  userId: number;

  @IsString()
  @Expose({ name: 'token', toPlainOnly: true })
  token: string;

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
