import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  grok: {
    apiKey: process.env.GROK_API_KEY,
    apiUrl: process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions',
    model: process.env.GROK_MODEL || 'grok-beta',
  },
}));
