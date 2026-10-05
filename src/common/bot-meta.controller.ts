import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProductsService } from '../products/products.service';

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
function cleanDescription(text: string | null | undefined, fallback: string = ''): string {
  if (!text) return fallback;
  const stripped = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  return stripped || fallback;
}

@ApiTags('produktet')
@Controller('produktet')
export class BotMetaController {
  private readonly logger = new Logger(BotMetaController.name);

  // Regex matching social media and search engine crawlers
  private readonly botUserAgents =
    /facebookexternalhit|viber|whatsapp|twitterbot|telegrambot|googlebot|bingbot|linkedinbot|slackbot|discordbot/i;

  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Serve dynamic OpenGraph meta tags for crawlers or redirect visitors to React SPA' })
  @ApiParam({ name: 'id', description: 'Product UUID or slug' })
  @ApiResponse({ status: 200, description: 'Dynamically generated HTML with OpenGraph and Twitter tags for crawlers' })
  @ApiResponse({ status: 302, description: 'Redirect standard browser visitors to the frontend SPA' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductMeta(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const cleanId = decodeURIComponent(id).trim();
    const userAgent = (req.headers['user-agent'] as string) || '';
    const isBot = this.botUserAgents.test(userAgent);

    // 1. If NOT from a bot (normal browser user hitting backend directly): redirect to frontend SPA
    if (!isBot) {
      res.redirect(`https://www.lemeaflagrance.shop/produktet/${id}`);
      return;
    }

    // 2. Fetch product entity from the database
    let product: any = null;
    try {
      product =
        typeof this.productsService.findByIdOrSlug === 'function'
          ? await this.productsService.findByIdOrSlug(cleanId)
          : await this.productsService.findOne(cleanId);
    } catch (error: any) {
      this.logger.error(`Error querying product ${cleanId}: ${error?.message || error}`);
      throw new NotFoundException('Product not found');
    }

    // 3. If product is not found: throw standard NestJS NotFoundException
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 4. Construct metadata fields
    const productTitle = product.title || product.name || 'Produkt';
    const price = product.price != null ? product.price : '';
    const fallbackDesc = `${productTitle} në Lemea Flagrance. Bli online me çmimin më të mirë prej ${price} Den.`;
    const description = cleanDescription(
      product.description || product.description_mk,
      fallbackDesc,
    );

    let imageUrl =
      product.imageUrl ||
      product.image ||
      (product.images && product.images.length > 0 ? product.images[0] : '');

    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      imageUrl = `https://www.lemeaflagrance.shop${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    if (!imageUrl) {
      imageUrl = 'https://www.lemeaflagrance.shop/og-image.jpg';
    }

    const titleWithPrice = `${productTitle} - ${price} Den`;
    const pageTitle = `${titleWithPrice} | Lemea Flagrance`;
    const ogUrl = `https://www.lemeaflagrance.shop/produktet/${id}`;

    // 5. Construct clean HTML string with OpenGraph and Twitter meta tags
    const html = `<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <!-- OpenGraph / Facebook / Viber / WhatsApp -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${escapeHtml(ogUrl)}">
  <meta property="og:title" content="${escapeHtml(titleWithPrice)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:site_name" content="Lemea Flagrance">
  <meta property="product:price:amount" content="${escapeHtml(price)}">
  <meta property="product:price:currency" content="MKD">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(ogUrl)}">
  <meta name="twitter:title" content="${escapeHtml(titleWithPrice)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">

  <!-- Canonical link -->
  <link rel="canonical" href="${escapeHtml(ogUrl)}">
</head>
<body>
  <h1>${escapeHtml(titleWithPrice)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(productTitle)}" style="max-width: 100%; height: auto;">
</body>
</html>`;

    // 6. Return HTML directly with 200 OK
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
    return;
  }
}
