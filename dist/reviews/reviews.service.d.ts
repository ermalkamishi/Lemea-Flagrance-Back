import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ConfigService } from '@nestjs/config';
export declare class ReviewsService {
    private readonly reviewRepository;
    private readonly configService;
    private transporter;
    constructor(reviewRepository: Repository<Review>, configService: ConfigService);
    create(createReviewDto: CreateReviewDto): Promise<Review>;
    private sendReviewEmail;
    findAll(): Promise<Review[]>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
