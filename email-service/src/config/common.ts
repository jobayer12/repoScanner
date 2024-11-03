import { registerAs } from '@nestjs/config';

export default registerAs('common', () => ({
  host: process.env.HOST,
  port: Number(process.env.PORT || 4000),
}));
