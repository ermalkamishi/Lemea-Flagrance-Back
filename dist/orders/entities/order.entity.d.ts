import { User } from '../../users/entities/user.entity';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export declare class Order {
    id: string;
    user: User;
    userId: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    address: string;
    items: any[];
    totalAmount: number;
    paymentMethod: string;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}
