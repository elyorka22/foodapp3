import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WsAuthService } from '../../common/security/ws-auth.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

type SocketData = {
  user?: JwtPayload;
};

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

  constructor(private wsAuth: WsAuthService) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.query?.token as string | undefined);
    const user = await this.wsAuth.verifySocketToken(token);
    (client.data as SocketData).user = user ?? undefined;
    this.logger.log(`Client connected: ${client.id}${user ? ` (${user.role})` : ''}`);
  }

  @SubscribeMessage('joinOrder')
  async handleJoinOrder(client: Socket, trackingToken: string) {
    if (!trackingToken || typeof trackingToken !== 'string') {
      return { error: 'trackingToken required' };
    }
    await this.wsAuth.assertTrackingToken(trackingToken.trim());
    client.join(`order:${trackingToken.trim()}`);
    return { joined: trackingToken };
  }

  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(client: Socket, restaurantId: string) {
    const user = this.wsAuth.requireUser((client.data as SocketData).user ?? null);
    this.wsAuth.assertRestaurant(user, restaurantId);
    client.join(`restaurant:${restaurantId}`);
    return { joined: restaurantId };
  }

  @SubscribeMessage('joinManager')
  handleJoinManager(client: Socket) {
    const user = this.wsAuth.requireUser((client.data as SocketData).user ?? null);
    this.wsAuth.assertManager(user);
    client.join('managers');
    return { joined: 'managers' };
  }

  @SubscribeMessage('joinCourier')
  async handleJoinCourier(client: Socket, courierId: string) {
    const user = this.wsAuth.requireUser((client.data as SocketData).user ?? null);
    await this.wsAuth.assertCourier(user, courierId);
    client.join(`courier:${courierId}`);
    return { joined: courierId };
  }

  @SubscribeMessage('joinAdmin')
  handleJoinAdmin(client: Socket) {
    const user = this.wsAuth.requireUser((client.data as SocketData).user ?? null);
    this.wsAuth.assertAdmin(user);
    client.join('admin');
    return { joined: 'admin' };
  }

  emitOrderUpdate(trackingToken: string, payload: unknown) {
    this.server.to(`order:${trackingToken}`).emit('orderUpdated', payload);
  }

  emitRestaurantOrder(restaurantId: string, payload: unknown) {
    this.server.to(`restaurant:${restaurantId}`).emit('newOrder', payload);
    this.server.to('managers').emit('newOrder', payload);
    this.emitAdminEvent('newOrder', payload);
  }

  emitAdminOrderUpdate(payload: unknown) {
    this.emitAdminEvent('orderUpdated', payload);
  }

  emitAdminEvent(event: string, payload: unknown) {
    this.server.to('admin').emit(event, payload);
    this.server.to('managers').emit(event, payload);
  }

  emitCourierAssignment(courierId: string, payload: unknown) {
    this.server.to(`courier:${courierId}`).emit('assignment', payload);
  }
}
