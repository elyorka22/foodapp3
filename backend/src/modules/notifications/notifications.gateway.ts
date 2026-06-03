import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationAccountType } from '@prisma/client';
import {
  CUSTOMER_JWT_ROLE,
  CustomerJwtPayload,
} from '../customers/customer-token.service';
import { WsAuthService } from '../../common/security/ws-auth.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

type SocketData = {
  customerId?: string;
  staffUser?: JwtPayload;
};

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private jwt: JwtService,
    private wsAuth: WsAuthService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.query?.token as string | undefined);

    const data = client.data as SocketData;

    if (token) {
      try {
        const payload = this.jwt.verify<CustomerJwtPayload | JwtPayload>(token);
        if ('role' in payload && payload.role === CUSTOMER_JWT_ROLE) {
          data.customerId = payload.sub;
          client.join(this.customerRoom(payload.sub));
          this.logger.log(`Customer WS connected: ${client.id}`);
          return;
        }
      } catch {
        /* try staff */
      }
      const staff = await this.wsAuth.verifySocketToken(token);
      if (staff) {
        data.staffUser = staff;
        client.join(this.staffRoom(staff.sub));
        this.logger.log(`Staff WS connected: ${client.id}`);
      }
    }
  }

  @SubscribeMessage('joinCustomer')
  handleJoinCustomer(client: Socket, customerId: string) {
    const data = client.data as SocketData;
    if (!data.customerId || data.customerId !== customerId) {
      return { error: 'Unauthorized' };
    }
    client.join(this.customerRoom(customerId));
    return { joined: customerId };
  }

  @SubscribeMessage('joinStaff')
  handleJoinStaff(client: Socket) {
    const data = client.data as SocketData;
    if (!data.staffUser) return { error: 'Unauthorized' };
    client.join(this.staffRoom(data.staffUser.sub));
    return { joined: data.staffUser.sub };
  }

  emitToRecipient(
    userId: string,
    accountType: NotificationAccountType,
    payload: unknown,
  ) {
    const room =
      accountType === NotificationAccountType.CUSTOMER
        ? this.customerRoom(userId)
        : this.staffRoom(userId);
    this.server.to(room).emit('notification', payload);
  }

  private customerRoom(customerId: string) {
    return `customer:${customerId}`;
  }

  private staffRoom(userId: string) {
    return `staff:${userId}`;
  }
}
