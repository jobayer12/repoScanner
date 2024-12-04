import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  emailQueue: process.env.EMAIL_QUEUE_NAME,
  url: process.env.RABBITMQ_URI,
  scanQueue: process.env.SCAN_QUEUE_NAME,
  rpcQueue: process.env.RPC_QUEUE_NAME,
}));
