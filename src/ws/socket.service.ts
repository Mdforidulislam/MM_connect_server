// src/websocket/websocket.gateway.ts

import { OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
  namespace: '/', 
})

export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }


  sendProgressToClients(data: any) {
    this.server.emit('progress', data);
  }

  @SubscribeMessage('progress')
  handleProgress(@MessageBody() data: { percent: number }) {
    this.server.emit('progress', data);
  }

}
