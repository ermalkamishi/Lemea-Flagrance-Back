export declare class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    oldPrice: number | null;
    discount: string | null;
    stockQuantity: number;
    inStock: boolean;
    image: string;
    images: string[];
    brand: string;
    category: string;
    isPopular: boolean;
    isNew: boolean;
    rating: number;
    reviewsCount: number;
    createdAt: Date;
    updatedAt: Date;
}
