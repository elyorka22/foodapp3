import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsPublicController {
  constructor(private settings: SettingsService) {}

  @Get('public')
  getPublic() {
    return this.settings.getPublicSettings();
  }
}
