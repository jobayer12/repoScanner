import { registerAs } from '@nestjs/config';

export default registerAs('zeromq', () => ({
  subURL: process.env.ZEROMQ_SUB_URL,
}));
