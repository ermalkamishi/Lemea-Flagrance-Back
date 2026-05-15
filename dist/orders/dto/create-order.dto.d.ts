export declare class CreateOrderDto {
    userId?: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    address: string;
    items: any[];
    totalAmount: number;
    paymentMethod?: string;
}
