import { BadRequestException, Injectable, Logger } from '@nestjs/common';

type EskizLoginResponse = {
  data?: { token?: string };
};

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private eskizToken = '';
  private eskizTokenAt = 0;

  async sendOtp(phone: string, code: string) {
    const provider = this.provider();
    const text = `FoodApp tasdiqlash kodi: ${code}`;

    if (provider === 'log') {
      this.logger.log(`OTP for ${phone}: ${code}`);
      return;
    }

    await this.sendEskiz(phone, text);
  }

  private provider() {
    const configured = (process.env.SMS_PROVIDER ?? '').trim().toLowerCase();
    if (configured === 'log' || configured === 'eskiz') return configured;
    return process.env.NODE_ENV === 'production' ? 'eskiz' : 'log';
  }

  private async sendEskiz(phone: string, text: string) {
    const email = process.env.ESKIZ_EMAIL?.trim();
    const password = process.env.ESKIZ_PASSWORD?.trim();
    const from = process.env.ESKIZ_FROM?.trim() || '4546';
    if (!email || !password) {
      throw new BadRequestException('SMS xizmati sozlanmagan');
    }

    const token = await this.eskizAccessToken(email, password);
    const mobile = phone.replace(/\D/g, '');
    const response = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile, message: text, from }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Eskiz SMS failed ${response.status}: ${body}`);
      throw new BadRequestException('SMS yuborib bo‘lmadi. Qayta urinib ko‘ring');
    }
  }

  private async eskizAccessToken(email: string, password: string) {
    const freshFor = 20 * 60 * 60 * 1000;
    if (this.eskizToken && Date.now() - this.eskizTokenAt < freshFor) {
      return this.eskizToken;
    }

    const response = await fetch('https://notify.eskiz.uz/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new BadRequestException('SMS xizmatiga ulanib bo‘lmadi');
    }

    const json = (await response.json()) as EskizLoginResponse;
    const token = json.data?.token;
    if (!token) {
      throw new BadRequestException('SMS xizmatiga ulanib bo‘lmadi');
    }
    this.eskizToken = token;
    this.eskizTokenAt = Date.now();
    return token;
  }
}
