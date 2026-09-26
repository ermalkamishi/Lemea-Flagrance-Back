import { BotMetaMiddleware } from './bot-meta.middleware';
import { ProductsService } from '../../products/products.service';

describe('BotMetaMiddleware', () => {
  let middleware: BotMetaMiddleware;
  let productsService: Partial<ProductsService>;

  beforeEach(() => {
    productsService = {
      findByIdOrSlug: jest.fn(),
      findOne: jest.fn(),
    };
    middleware = new BotMetaMiddleware(productsService as ProductsService);
  });

  const createMockReqRes = (options: {
    method?: string;
    userAgent?: string;
    path?: string;
  }) => {
    const req: any = {
      method: options.method || 'GET',
      headers: {
        'user-agent': options.userAgent || '',
      },
      path: options.path || '/produktet/test-id',
    };

    let sentData: any = null;
    let statusCode: number | null = null;
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
      _getData: () => sentData,
      _getStatus: () => statusCode,
      _getHeaders: () => headers,
    };

    const next = jest.fn();

    return { req, res, next };
  };

  it('should call next() for standard browser requests', async () => {
    const { req, res, next } = createMockReqRes({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      path: '/produktet/12345',
    });

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next() for non-GET requests', async () => {
    const { req, res, next } = createMockReqRes({
      method: 'POST',
      userAgent: 'facebookexternalhit/1.1',
      path: '/produktet/12345',
    });

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next() for routes that do not match product patterns', async () => {
    const { req, res, next } = createMockReqRes({
      userAgent: 'facebookexternalhit/1.1',
      path: '/about-us',
    });

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should serve HTML with OG and Twitter tags when crawler hits a product route', async () => {
    const mockProduct: any = {
      id: 'd8c83e1c-5d5e-4c7b-91f1-3962b9a7c36d',
      name: 'Bleu de Chanel',
      price: 4500,
      description: 'Luks dhe freski aromatike.',
      image: 'https://res.cloudinary.com/test/image.jpg',
    };

    (productsService.findByIdOrSlug as jest.Mock).mockResolvedValue(mockProduct);

    const { req, res, next } = createMockReqRes({
      userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      path: '/produktet/d8c83e1c-5d5e-4c7b-91f1-3962b9a7c36d',
    });

    await middleware.use(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    const html = res._getData();
    expect(html).toContain('<title>Bleu de Chanel - 4500 Den | Lemea Fragrance</title>');
    expect(html).toContain('<meta property="og:title" content="Bleu de Chanel - 4500 Den">');
    expect(html).toContain('<meta property="og:description" content="Luks dhe freski aromatike.">');
    expect(html).toContain('<meta property="og:image" content="https://res.cloudinary.com/test/image.jpg">');
    expect(html).toContain('<meta property="og:url" content="https://www.lemeaflagrance.shop/produktet/d8c83e1c-5d5e-4c7b-91f1-3962b9a7c36d">');
    expect(html).toContain('<meta property="og:type" content="product">');
    expect(html).toContain('<meta property="product:price:amount" content="4500">');
    expect(html).toContain('<meta property="product:price:currency" content="MKD">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain('<meta name="twitter:title" content="Bleu de Chanel - 4500 Den">');
    expect(html).toContain('<meta name="twitter:description" content="Luks dhe freski aromatike.">');
    expect(html).toContain('<meta name="twitter:image" content="https://res.cloudinary.com/test/image.jpg">');
  });

  it('should detect various bots: viber, whatsapp, twitterbot, telegrambot, googlebot, etc.', async () => {
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
      id: 'test-slug',
      name: 'Dior Sauvage',
      price: 3800,
    };
    (productsService.findByIdOrSlug as jest.Mock).mockResolvedValue(mockProduct);

    for (const bot of bots) {
      const { req, res, next } = createMockReqRes({
        userAgent: bot,
        path: '/produktet/dior-sauvage',
      });

      await middleware.use(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    }
  });

  it('should call next() if product is not found', async () => {
    (productsService.findByIdOrSlug as jest.Mock).mockResolvedValue(null);

    const { req, res, next } = createMockReqRes({
      userAgent: 'facebookexternalhit/1.1',
      path: '/produktet/nonexistent-product',
    });

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should quietly call next() if an exception is thrown', async () => {
    (productsService.findByIdOrSlug as jest.Mock).mockRejectedValue(new Error('DB failure'));

    const { req, res, next } = createMockReqRes({
      userAgent: 'facebookexternalhit/1.1',
      path: '/produktet/error-id',
    });

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
