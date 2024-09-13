import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ScanService } from './scan.service';
import { ScanPayloadDto } from './dto/scan.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../common/interceptor/response.interceptor';
import { AuthGuard } from '../../common/guards/AuthGuard';
import { UserDto } from '../user/dto/user.dto';

@Controller('')
@ApiTags('scan')
@ApiBearerAuth('jwt')
@UseInterceptors(ResponseInterceptor)
@UseGuards(AuthGuard)
export class ScanController {
  constructor(
    private readonly scanService: ScanService,
    @Inject('LOGGED_IN_USER') private readonly session: UserDto,
  ) {}

  @Post()
  async scan(@Body() payload: ScanPayloadDto): Promise<string> {
    return this.scanService.scan(payload, this.session);
  }
}
