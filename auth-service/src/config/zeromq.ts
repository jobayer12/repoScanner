import { registerAs } from '@nestjs/config';

export default registerAs('zeromq', () => ({
  url: process.env.ZEROMQ_URL || 'localhost',
  port: process.env.ZEROMQ_PORT || 9812,
}));
