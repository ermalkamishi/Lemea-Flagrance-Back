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
    const [totalOrders, totalProducts, totalReviews, pendingOrders, revenueRow] =
      await Promise.all([
        this.orderRepo.count(),
        this.productRepo.count(),
        this.reviewRepo.count(),
        this.orderRepo.count({ where: { status: 'pending' } }),
        // Sum in the database instead of loading every order into memory
        this.orderRepo
          .createQueryBuilder('o')
          .select('COALESCE(SUM(o.totalAmount), 0)', 'total')
          .getRawOne<{ total: string }>(),
      ]);
    const totalRevenue = Number(revenueRow?.total ?? 0);

    return {
      totalOrders,
      totalProducts,
      totalReviews,
      totalRevenue,
      pendingOrders,
    };
  }
}
