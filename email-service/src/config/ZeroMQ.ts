import { registerAs } from '@nestjs/config';

export default registerAs('zeromq', () => ({
  host: process.env.ZEROMQ_HOST || 'localhost',
  port: process.env.ZEROMQ_PORT || 9812,
}));
