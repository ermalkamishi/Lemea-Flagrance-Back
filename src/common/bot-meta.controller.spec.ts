import { NotFoundException } from '@nestjs/common';
import { BotMetaController } from './bot-meta.controller';
import { ProductsService } from '../products/products.service';

describe('BotMetaController', () => {
  let controller: BotMetaController;
  let productsService: Partial<ProductsService>;

  beforeEach(() => {
    productsService = {
      findByIdOrSlug: jest.fn(),
      findOne: jest.fn(),
    };
    controller = new BotMetaController(productsService as ProductsService);
  });

  const createMockReqRes = (options: {
    userAgent?: string;
  }) => {
    const req: any = {
      headers: {
        'user-agent': options.userAgent || '',
      },
    };

    let sentData: any = null;
    let statusCode: number | null = null;
    let redirectUrl: string | null = null;
    const headers: Record<string, string> = {};

    const res: any = {
      setHeader: jest.fn((key: string, val: string) => {
        headers[key.toLowerCase()] = val;
      }),
      status: jest.fn((code: number) => {
        statusCode = code;
        return res;
      }),
      send: jest.fn((data: any) => {
        sentData = data;
        return res;
      }),
      redirect: jest.fn((url: string) => {
        redirectUrl = url;
        return res;
      }),
      _getData: () => sentData,
      _getStatus: () => statusCode,
      _getRedirect: () => redirectUrl,
      _getHeaders: () => headers,
    };

    return { req, res };
  };

  it('should redirect regular browser users to the React SPA frontend', async () => {
    const { req, res } = createMockReqRes({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    await controller.getProductMeta('test-product-id', req, res);

    expect(res.redirect).toHaveBeenCalledWith('https://www.lemeaflagrance.shop/produktet/test-product-id');
    expect(res.send).not.toHaveBeenCalled();
    expect(productsService.findByIdOrSlug).not.toHaveBeenCalled();
  });

  it('should serve HTML with OG and Twitter meta tags to crawlers/bots when product exists', async () => {
    const mockProduct: any = {
      id: 'd8c83e1c-5d5e-4c7b-91f1-3962b9a7c36d',
      name: 'Bleu de Chanel',
      price: 4500,
      description: 'Aromatic woody fragrance.',
      imageUrl: 'https://res.cloudinary.com/test/image.jpg',
    };

    (productsService.findByIdOrSlug as jest.Mock).mockResolvedValue(mockProduct);

    const { req, res } = createMockReqRes({
      userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    });

    await controller.getProductMeta('d8c83e1c-5d5e-4c7b-91f1-3962b9a7c36d', req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const html = res._getData();

    expect(html).toContain('<title>Bleu de Chanel - 4500 Den | Lemea Fragrance</title>');
    expect(html).toContain('<meta name="description" content="Aromatic woody fragrance.">');
    expect(html).toContain('<meta property="og:title" content="Bleu de Chanel - 4500 Den">');
    expect(html).toContain('<meta property="og:description" content="Aromatic woody fragrance.">');
    expect(html).toContain('<meta property="og:image" content="https://res.cloudinary.com/test/image.jpg">');
    expect(html).toContain('<meta property="og:url" content="https://www.lemeaflagrance.shop/produktet/d8c83e1c-5d5e-4c7b-91f1-3962b9a7c36d">');
    expect(html).toContain('<meta property="og:type" content="product">');
    expect(html).toContain('<meta property="product:price:amount" content="4500">');
    expect(html).toContain('<meta property="product:price:currency" content="MKD">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain('<meta name="twitter:title" content="Bleu de Chanel - 4500 Den">');
    expect(html).toContain('<meta name="twitter:description" content="Aromatic woody fragrance.">');
    expect(html).toContain('<meta name="twitter:image" content="https://res.cloudinary.com/test/image.jpg">');
  });

  it('should detect crawlers: Viber, WhatsApp, Twitter, Telegram, Googlebot, Slackbot, etc.', async () => {
    const bots = [
      'Viber',
      'WhatsApp/2.21.11.17 A',
      'Twitterbot/1.0',
      'TelegramBot (like TwitterBot)',
      'Googlebot/2.1 (+http://www.google.com/bot.html)',
      'bingbot/2.0',
      'LinkedInBot/1.0',
      'Slackbot-LinkExpanding 1.0',
      'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
    ];

    const mockProduct: any = {
      id: 'dior-sauvage',
      name: 'Dior Sauvage',
      price: 3800,
    };
    (productsService.findByIdOrSlug as jest.Mock).mockResolvedValue(mockProduct);

    for (const bot of bots) {
      const { req, res } = createMockReqRes({ userAgent: bot });
      await controller.getProductMeta('dior-sauvage', req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.redirect).not.toHaveBeenCalled();
    }
  });

  it('should throw NotFoundException if product is not found', async () => {
    (productsService.findByIdOrSlug as jest.Mock).mockResolvedValue(null);

    const { req, res } = createMockReqRes({
      userAgent: 'facebookexternalhit/1.1',
    });

    await expect(controller.getProductMeta('nonexistent-id', req, res)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if database query throws an error', async () => {
    (productsService.findByIdOrSlug as jest.Mock).mockRejectedValue(new Error('DB connection failed'));

    const { req, res } = createMockReqRes({
      userAgent: 'facebookexternalhit/1.1',
    });

    await expect(controller.getProductMeta('error-id', req, res)).rejects.toThrow(
      NotFoundException,
    );
  });
});
