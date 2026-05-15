import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Review } from '../reviews/entities/review.entity';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
  ) {}

  @Get('stats')
  async getStats() {
    const totalOrders = await this.orderRepo.count();
    const totalProducts = await this.productRepo.count();
    const totalReviews = await this.reviewRepo.count();
    
    // Calculate total revenue
    const orders = await this.orderRepo.find();
    const totalRevenue = orders.reduce((acc, order) => acc + Number(order.totalAmount), 0);

    const pendingOrders = await this.orderRepo.count({ where: { status: 'pending' } });

    return {
      totalOrders,
      totalProducts,
      totalReviews,
      totalRevenue,
      pendingOrders,
    };
  }
}
