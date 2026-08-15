import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const review = this.reviewRepository.create(createReviewDto);
    const savedReview = await this.reviewRepository.save(review);

    if (savedReview.productId) {
      await this.updateProductRating(savedReview.productId);
    }

    // Send notification email to the owner (fire-and-forget)
    this.sendReviewEmail(savedReview).catch(console.error);

    return savedReview;
  }

  private async updateProductRating(productId: string) {
    try {
      const reviews = await this.reviewRepository.find({
        where: { productId, isApproved: true },
      });
      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
        const avg = Math.round((sum / reviews.length) * 10) / 10;
        await this.productRepository.update(productId, {
          rating: avg,
          reviewsCount: reviews.length,
        });
      }
    } catch (e) {
      console.error('Error updating product rating:', e);
    }
  }

  private async sendReviewEmail(review: Review) {
    const ownerEmail = this.configService.get<string>('EMAIL');
    if (!ownerEmail) return;

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

    const resendKey = this.configService.get<string>('RESEND_API_KEY') || process.env.RESEND_API_KEY;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Lemea Reviews <onboarding@resend.dev>',
          to: ownerEmail,
          subject: `🌟 Vlerësim i Ri (${review.rating} Yje) - ${review.name}`,
          html: emailHtml
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      console.log('Review notification email sent successfully via Resend.');
    } catch (error) {
      console.error('Resend Review Error:', error.message);
    }
  }

  findAll() {
    return this.reviewRepository.find({
      where: { isApproved: true },
      order: { createdAt: 'DESC' },
    });
  }

  findByProduct(productId: string) {
    return this.reviewRepository.find({
      where: { productId, isApproved: true },
      order: { createdAt: 'DESC' },
    });
  }

  remove(id: string) {
    return this.reviewRepository.delete(id);
  }
}
