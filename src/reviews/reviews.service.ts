import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ReviewsService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async create(createReviewDto: CreateReviewDto) {
    const review = this.reviewRepository.create(createReviewDto);
    const savedReview = await this.reviewRepository.save(review);

    // Send notification email to the owner
    await this.sendReviewEmail(savedReview);

    return savedReview;
  }

  private async sendReviewEmail(review: Review) {
    const ownerEmail = this.configService.get<string>('EMAIL');

    const stars = '⭐'.repeat(review.rating);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #f43f5e, #fb923c); color: white !important; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .review-box { background: #fff7ed; border-radius: 15px; padding: 25px; margin-bottom: 25px; border: 1px solid #fed7aa; text-align: center; }
          .stars { font-size: 32px; margin-bottom: 10px; }
          .comment { font-style: italic; color: #4b5563; font-size: 18px; margin-top: 15px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #999; }
          .badge { background: #fb923c; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 10px; }
          h2 { margin-top: 0; color: #111827; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; color: white;">VLERËSIM I RI</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; color: white;">Një klient sapo ndau mendimin e tij!</p>
          </div>
          <div class="content">
            <div class="review-box">
              <span class="badge">KLIENTI: ${review.name}</span>
              <div class="stars">${stars}</div>
              <h2 style="margin: 10px 0; color: #fb923c;">Vlerësimi: ${review.rating}/5</h2>
              ${review.comment ? `<div class="comment">"${review.comment}"</div>` : '<p style="color: #9ca3af;">Pa koment.</p>'}
            </div>
            
            <p style="text-align: center; color: #666; font-size: 14px;">
              Ky vlerësim është ruajtur në sistem dhe do të shfaqet në faqen tuaj.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Lemea Fragrance Dashboard. Feedback-u i klientëve është çelësi i suksesit!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Lemea Reviews" <${ownerEmail}>`,
        to: ownerEmail,
        subject: `🌟 Vlerësim i Ri (${review.rating} Yje) - ${review.name}`,
        html: emailHtml,
      });
      console.log('Review notification email sent successfully.');
    } catch (error) {
      console.error('Nodemailer Review Error:', error.message);
    }
  }

  findAll() {
    return this.reviewRepository.find({
      where: { isApproved: true },
      order: { createdAt: 'DESC' },
    });
  }

  remove(id: string) {
    return this.reviewRepository.delete(id);
  }
}
