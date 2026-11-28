import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RateLimit } from '../common/rate-limit.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @RateLimit(10, 10) // 10 orders per 10 minutes per IP (stops fake-order spam)
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Create a new order (guest or logged-in user)' })
  create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    // req.ip is the real client IP because 'trust proxy' is enabled in main.ts
    const ip = req.ip || req.socket?.remoteAddress;
    // Never trust a userId sent by the client: take it from the verified JWT (or none for guests)
    return this.ordersService.create({
      ...createOrderDto,
      userId: req.user?.id ?? undefined,
      ipAddress: ip,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'List all orders' })
  findAll() {
    return this.ordersService.findAll();
  }

  // Get orders for the currently logged-in user
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('my-orders')
  @ApiOperation({ summary: 'Get orders for logged-in user' })
  findMyOrders(@Request() req: any) {
    return this.ordersService.findByUser(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
