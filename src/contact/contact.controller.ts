import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { RateLimit } from '../common/rate-limit.decorator';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @RateLimit(5, 60) // 5 messages per hour per IP (protects inbox / Resend quota)
  @ApiOperation({ summary: 'Send a contact email' })
  async sendContact(@Body() body: CreateContactDto) {
    await this.contactService.sendContactEmail(body);
    return { success: true, message: 'Email sent successfully' };
  }
}
