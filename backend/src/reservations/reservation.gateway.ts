import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

// CORS WS: w prod ustaw CORS_ORIGIN (lista origenów po przecinku); domyślnie
// permisywnie, ale połączenie i tak wymaga ważnego JWT + roli manager/admin (#67)
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : true,
    credentials: true,
  },
})
@Injectable()
export class ReservationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedManagers = new Map<string, number>(); // clientID -> userID
  private readonly logger = new Logger(ReservationGateway.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract JWT token from authorization header
      const authHeader = client.handshake.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.logger.warn(`Unauthorized connection attempt - no valid token`);
        client.disconnect();
        return;
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix
      const decoded = this.jwtService.verify(token);
      // Payload JWT: { email, sub: userId, role } — id jest w `sub`
      const userId = decoded.sub ?? decoded.id;

      // Verify that the user is a manager (lub admin)
      const user = await this.usersService.findOne(userId);

      if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
        this.logger.warn(`Non-manager connection attempt - user ID: ${userId}`);
        client.disconnect();
        return;
      }

      // Store connected manager
      this.connectedManagers.set(client.id, userId);
      this.logger.log(`Manager connected: ${userId} (client: ${client.id})`);
      
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove manager from registry when disconnected
    const userId = this.connectedManagers.get(client.id);
    if (userId) {
      this.connectedManagers.delete(client.id);
      this.logger.log(`Manager disconnected: ${userId} (client: ${client.id})`);
    }
  }

  async handleNewReservation(reservationData: any) {
    // Only send to connected managers
    if (this.connectedManagers.size > 0) {
      this.logger.log(`Sending reservation notification to ${this.connectedManagers.size} connected managers`);
      this.server.emit('new-reservation', reservationData);
    } else {
      this.logger.log('No managers connected - skipping notification');
    }
  }
}