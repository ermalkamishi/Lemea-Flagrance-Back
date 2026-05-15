import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async sendContact(@Body() body: { name: string; email: string; subject: string; message: string }) {
    await this.contactService.sendContactEmail(body);
    return { success: true, message: 'Email sent successfully' };
  }
}
