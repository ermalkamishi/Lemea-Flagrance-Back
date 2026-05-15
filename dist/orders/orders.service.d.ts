import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductsService } from '../products/products.service';
import { ConfigService } from '@nestjs/config';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly productsService;
    private readonly configService;
    private transporter;
    constructor(orderRepository: Repository<Order>, productsService: ProductsService, configService: ConfigService);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    private sendOrderEmail;
    findAll(): Promise<Order[]>;
    findByUser(userId: string): Promise<Order[]>;
    findOne(id: string): Promise<Order | null>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
