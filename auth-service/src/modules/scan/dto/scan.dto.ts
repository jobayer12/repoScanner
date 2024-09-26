import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { isValidGitHubRepoUrl } from '../../../common/utils/url.validate';
import { Expose, Transform, TransformFnParams } from 'class-transformer';
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
      'Set any specific branch you want to app otherwise system will app the default branch.',
  })
  @IsOptional()
  @IsString()
  branch?: string;
}

export class ScanSaveDto {
  @IsString()
  @Expose({ name: 'repository', toPlainOnly: true })
  @Transform((params: TransformFnParams) => {
    if (!isValidGitHubRepoUrl(params?.value)) {
      throw new NotAcceptableException('Invalid github repo url provided.');
    }
    return params.value;
  })
  repository: string;

  @Expose({ name: 'branch', toPlainOnly: true })
  @IsString()
  branch: string;

  @Expose({ name: 'sha', toPlainOnly: true })
  @IsString()
  sha: string;

  @IsNumber()
  @Expose({ name: 'user_id', toPlainOnly: true })
  userId: number;

  @Expose({ name: 'result', toPlainOnly: true })
  result: any;

  @Expose({ name: 'status', toPlainOnly: true })
  status: 'SCAN_STARTED' | 'SCAN_FAILED' | 'SCAN_DONE';
}

export class ScanResponseDto extends ScanSaveDto {
  @IsString()
  @IsUUID()
  id: string;
}

export class ZeroMQPublishMessageDto extends ScanPayloadDto {
  @IsString()
  messageId: number;

  @IsString()
  accountId: string;
}
