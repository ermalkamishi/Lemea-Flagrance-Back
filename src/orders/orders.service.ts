import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductsService } from '../products/products.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    const order = this.orderRepository.create(createOrderDto);
    const savedOrder = await this.orderRepository.save(order);

    // Decrement stock for each item
    try {
      console.log('Processing stock decrement for order items:', savedOrder.items);
      if (savedOrder.items && Array.isArray(savedOrder.items)) {
        for (const item of savedOrder.items) {
          const pid = item.productId || item.id;
          console.log(`Checking item: ${item.name}, ID: ${pid}, Qty: ${item.quantity}`);
          if (pid) {
            await this.productsService.decrementStock(pid, item.quantity || 1);
            console.log(`Stock decremented successfully for product ${pid}`);
          } else {
            console.warn('No productId or id found for item:', item);
          }
        }
      } else {
        console.warn('No items found or items is not an array in savedOrder');
      }
    } catch (stockError) {
      console.error('Failed to update stock:', stockError.message);
    }

    // Send email via Nodemailer to the owner (fire-and-forget so checkout doesn't hang)
    this.sendOrderEmail(savedOrder).catch(console.error);

    return savedOrder;
  }

  private async sendOrderEmail(order: Order) {
    const ownerEmail = this.configService.get<string>('EMAIL');

    const itemsHtml = order.items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left;">
          <div style="font-weight: bold; color: #333;">${item.name}</div>
          <div style="font-size: 12px; color: #666;">Sasia: ${item.quantity}</div>
        </td>
        <td style="padding: 12px; text-align: right; color: #ec4899; font-weight: bold;">
          ${(item.price * item.quantity).toLocaleString()} Den
        </td>
      </tr>
    `,
      )
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

    const resendKey = this.configService.get<string>('RESEND_API_KEY') || process.env.RESEND_API_KEY;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Lemea Orders <onboarding@resend.dev>',
          to: ownerEmail,
          subject: `🔔 Porosi e Re #${order.id.slice(0, 8)} - ${order.firstName} ${order.lastName}`,
          html: emailHtml
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      console.log('Order notification email sent successfully via Resend.');
    } catch (error) {
      console.error('Failed to send email via Resend:', error.message);
    }
  }

  findAll() {
    return this.orderRepository.find({ order: { createdAt: 'DESC' } });
  }

  findByUser(userId: string) {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.orderRepository.findOne({ where: { id } });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.update(id, updateOrderDto);
  }

  remove(id: string) {
    return this.orderRepository.delete(id);
  }
}
