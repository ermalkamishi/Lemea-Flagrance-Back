import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Review } from '../reviews/entities/review.entity';
export declare class AdminController {
    private orderRepo;
    private productRepo;
    private reviewRepo;
    constructor(orderRepo: Repository<Order>, productRepo: Repository<Product>, reviewRepo: Repository<Review>);
    getStats(): Promise<{
        totalOrders: number;
        totalProducts: number;
        totalReviews: number;
        totalRevenue: number;
        pendingOrders: number;
    }>;
}
