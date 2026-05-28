import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/orders',
})
export class OrdersGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('joinOrder')
  handleJoinOrder(client: Socket, trackingToken: string) {
    client.join(`order:${trackingToken}`);
    return { joined: trackingToken };
  }

  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(client: Socket, restaurantId: string) {
    client.join(`restaurant:${restaurantId}`);
    return { joined: restaurantId };
  }

  @SubscribeMessage('joinManager')
  handleJoinManager(client: Socket) {
    client.join('managers');
    return { joined: 'managers' };
  }

  @SubscribeMessage('joinCourier')
  handleJoinCourier(client: Socket, courierId: string) {
    client.join(`courier:${courierId}`);
    return { joined: courierId };
  }

  emitOrderUpdate(trackingToken: string, payload: unknown) {
    this.server.to(`order:${trackingToken}`).emit('orderUpdated', payload);
  }

  emitRestaurantOrder(restaurantId: string, payload: unknown) {
    this.server.to(`restaurant:${restaurantId}`).emit('newOrder', payload);
    this.server.to('managers').emit('newOrder', payload);
  }

  emitCourierAssignment(courierId: string, payload: unknown) {
    this.server.to(`courier:${courierId}`).emit('assignment', payload);
  }
}
