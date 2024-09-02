import { IsOptional, IsString } from 'class-validator';
import { isValidGitHubRepoUrl } from '../../../common/utils/url.validate';
import { Transform, TransformFnParams } from 'class-transformer';
import { NotAcceptableException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ScanPayloadDto {
  @ApiProperty({
    name: 'repository',
    description:
      'Github repository URL. For example: https://github.com/jobayer12/repoScanner',
  })
  @IsString()
  @Transform((params: TransformFnParams) => {
    if (!isValidGitHubRepoUrl(params?.value)) {
      throw new NotAcceptableException('Invalid github repo url provided.');
    }
    return params.value;
  })
  repository: string;

  @ApiProperty({
    name: 'branch',
    description:
      'Set any specific branch you want to scan otherwise system will scan the default branch.',
  })
  @IsOptional()
  @IsString()
  branch?: string;
}

export class ZeroMQPublishMessageDto extends ScanPayloadDto {
  @IsString()
  messageId: number;

  @IsString()
  accountId: string;
}
