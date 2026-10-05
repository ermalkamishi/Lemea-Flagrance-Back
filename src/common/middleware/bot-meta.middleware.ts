import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProductsService } from '../../products/products.service';

/**
 * Escapes characters for safe inclusion in HTML content and attributes.
 */
function escapeHtml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Cleans descriptions by stripping HTML tags and excess whitespace.
 */
function cleanDescription(text: string | null | undefined, fallback: string): string {
  if (!text) return fallback;
  const stripped = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  return stripped || fallback;
}

@Injectable()
export class BotMetaMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BotMetaMiddleware.name);

  // Regex for social media and search engine crawlers
  private readonly botUserAgents =
    /facebookexternalhit|facebot|viber|whatsapp|twitterbot|telegrambot|googlebot|bingbot|linkedinbot|slackbot|discordbot/i;

  // Regex matching product route patterns e.g. /produktet/:id or /products/:id
  private readonly productRouteRegex =
    /^\/(?:produktet|products)\/([^\s\/?#]+)\/?$/i;

  constructor(private readonly productsService: ProductsService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // 1. Intercept only incoming HTTP GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // 2. Read User-Agent header and detect if the request originates from a crawler
    const userAgent = req.headers['user-agent'] || '';
    if (!userAgent || !this.botUserAgents.test(userAgent)) {
      return next();
    }

    // 3. Check if the route matches product URL patterns (/produktet/:id or /products/:id)
    const requestPath = req.path || (req.originalUrl ? req.originalUrl.split('?')[0] : '');
    const match = requestPath.match(this.productRouteRegex);
    if (!match) {
      return next();
    }

    const productIdOrSlug = decodeURIComponent(match[1]).trim();
    if (!productIdOrSlug) {
      return next();
    }

    // 4. Fetch product entity asynchronously from the database
    try {
      const product =
        typeof this.productsService.findByIdOrSlug === 'function'
          ? await this.productsService.findByIdOrSlug(productIdOrSlug)
          : await this.productsService.findOne(productIdOrSlug);

      // If product is not found, let standard SPA handle it (e.g. 404 page)
      if (!product) {
        return next();
      }

      // 5. Build metadata fields
      const productTitle = (product as any).title || product.name || 'Produkt';
      const price = product.price != null ? product.price : '';
      const fallbackDesc = `${productTitle} në Lemea Flagrance. Bli online me çmimin më të mirë prej ${price} Den.`;
      const description = cleanDescription(
        product.description || (product as any).description_mk,
        fallbackDesc,
      );

      // Resolve main product image URL
      let imageUrl =
        product.image ||
        (product.images && product.images.length > 0 ? product.images[0] : '');

      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `https://www.lemeaflagrance.shop${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      if (!imageUrl) {
        imageUrl = 'https://www.lemeaflagrance.shop/og-image.jpg';
      }

      const fullUrl = `https://www.lemeaflagrance.shop${req.path}`;
      const titleWithPrice = `${productTitle} - ${price} Den`;
      const pageTitle = `${titleWithPrice} | Lemea Flagrance`;

      // 6. Generate clean HTML string formatted with proper OG and Twitter meta tags
      const html = `<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <!-- OpenGraph / Facebook / Viber / WhatsApp -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${escapeHtml(fullUrl)}">
  <meta property="og:title" content="${escapeHtml(titleWithPrice)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:site_name" content="Lemea Flagrance">
  <meta property="product:price:amount" content="${escapeHtml(price)}">
  <meta property="product:price:currency" content="MKD">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(fullUrl)}">
  <meta name="twitter:title" content="${escapeHtml(titleWithPrice)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">

  <!-- Canonical link -->
  <link rel="canonical" href="${escapeHtml(fullUrl)}">
</head>
<body>
  <h1>${escapeHtml(titleWithPrice)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(productTitle)}" style="max-width: 100%; height: auto;">
</body>
</html>`;

      // 7. Send the HTML response directly with status 200 OK
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
      return;
    } catch (error: any) {
      // Quietly log error and fallback to standard SPA
      this.logger.warn(
        `Failed to generate bot meta for product "${productIdOrSlug}": ${error?.message || error}`,
      );
      return next();
    }
  }
}
