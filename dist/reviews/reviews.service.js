"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./entities/review.entity");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let ReviewsService = class ReviewsService {
    reviewRepository;
    configService;
    transporter;
    constructor(reviewRepository, configService) {
        this.reviewRepository = reviewRepository;
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get('EMAIL'),
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
    }
    async create(createReviewDto) {
        const review = this.reviewRepository.create(createReviewDto);
        const savedReview = await this.reviewRepository.save(review);
        await this.sendReviewEmail(savedReview);
        return savedReview;
    }
    async sendReviewEmail(review) {
        const ownerEmail = this.configService.get('EMAIL');
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
        }
        catch (error) {
            console.error('Nodemailer Review Error:', error.message);
        }
    }
    findAll() {
        return this.reviewRepository.find({
            where: { isApproved: true },
            order: { createdAt: 'DESC' },
        });
    }
    remove(id) {
        return this.reviewRepository.delete(id);
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map