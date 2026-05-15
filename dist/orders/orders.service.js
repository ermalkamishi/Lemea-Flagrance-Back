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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const products_service_1 = require("../products/products.service");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let OrdersService = class OrdersService {
    orderRepository;
    productsService;
    configService;
    transporter;
    constructor(orderRepository, productsService, configService) {
        this.orderRepository = orderRepository;
        this.productsService = productsService;
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get('EMAIL'),
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
    }
    async create(createOrderDto) {
        const order = this.orderRepository.create(createOrderDto);
        const savedOrder = await this.orderRepository.save(order);
        try {
            if (savedOrder.items && Array.isArray(savedOrder.items)) {
                for (const item of savedOrder.items) {
                    const pid = item.productId || item.id;
                    if (pid) {
                        await this.productsService.decrementStock(pid, item.quantity || 1);
                    }
                }
            }
        }
        catch (stockError) {
            console.error('Failed to update stock:', stockError.message);
        }
        await this.sendOrderEmail(savedOrder);
        return savedOrder;
    }
    async sendOrderEmail(order) {
        const ownerEmail = this.configService.get('EMAIL');
        const itemsHtml = order.items
            .map((item) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left;">
          <div style="font-weight: bold; color: #333;">${item.name}</div>
          <div style="font-size: 12px; color: #666;">Sasia: ${item.quantity}</div>
        </td>
        <td style="padding: 12px; text-align: right; color: #ec4899; font-weight: bold;">
          ${(item.price * item.quantity).toLocaleString()} Den
        </td>
      </tr>
    `)
            .join('');
        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #ec4899, #f43f5e); color: white !important; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .info-box { background: #f9fafb; border-radius: 15px; padding: 20px; margin-bottom: 25px; border: 1px solid #f3f4f6; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #999; }
          .status-badge { background: #fef3f2; color: #e11d48; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; display: inline-block; }
          h2 { margin-top: 0; color: #111827; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; color: white;">LEMEA FRAGRANCE</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; color: white;">Porosi e Re e Marrë!</p>
          </div>
          <div class="content">
            <div style="margin-bottom: 20px; text-align: left;">
              <span class="status-badge">E RE</span>
              <h2 style="margin-top: 15px;">Detajet e Porosisë</h2>
            </div>
            
            <div class="info-box">
              <p style="margin: 5px 0;"><strong>Klienti:</strong> ${order.firstName} ${order.lastName}</p>
              <p style="margin: 5px 0;"><strong>Telefoni:</strong> ${order.phone}</p>
              <p style="margin: 5px 0;"><strong>Qyteti:</strong> ${order.city}</p>
              <p style="margin: 5px 0;"><strong>Adresa:</strong> ${order.address}</p>
              <p style="margin: 5px 0;"><strong>Metoda e Pagesës:</strong> ${order.paymentMethod === 'cod' ? 'Pagesë në dorëzim (Cash)' : order.paymentMethod}</p>
            </div>

            <table class="table">
              <thead>
                <tr style="background: #f3f4f6; text-align: left;">
                  <th style="padding: 12px; border-radius: 10px 0 0 10px;">Produkti</th>
                  <th style="padding: 12px; text-align: right; border-radius: 0 10px 10px 0;">Çmimi</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 30px; text-align: right; padding-right: 12px;">
              <p style="font-size: 16px; color: #666; margin-bottom: 5px;">Total i Përgjithshëm:</p>
              <h2 style="color: #ec4899; font-size: 36px; margin: 0;">${order.totalAmount.toLocaleString()} Den</h2>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Lemea Fragrance. Ky është një email automatik për njoftimin e porosive.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        try {
            await this.transporter.sendMail({
                from: `"Lemea Flagrance" <${ownerEmail}>`,
                to: ownerEmail,
                subject: `🔔 Porosi e Re #${order.id.slice(0, 8)} - ${order.firstName} ${order.lastName}`,
                html: emailHtml,
            });
            console.log('Order notification email sent successfully via Nodemailer.');
        }
        catch (error) {
            console.error('Failed to send email via Nodemailer:', error.message);
        }
    }
    findAll() {
        return this.orderRepository.find({ order: { createdAt: 'DESC' } });
    }
    findByUser(userId) {
        return this.orderRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    findOne(id) {
        return this.orderRepository.findOne({ where: { id } });
    }
    update(id, updateOrderDto) {
        return this.orderRepository.update(id, updateOrderDto);
    }
    remove(id) {
        return this.orderRepository.delete(id);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        products_service_1.ProductsService,
        config_1.ConfigService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map