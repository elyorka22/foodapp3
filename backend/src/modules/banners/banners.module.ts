import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';

@Module({
  imports: [SettingsModule],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
