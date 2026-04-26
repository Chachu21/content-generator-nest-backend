import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  chapa: {
    secretKey: process.env.CHAPA_SECRET_KEY,
    apiUrl: process.env.CHAPA_API_URL || 'https://api.chapa.co/v1',
  },
}));
