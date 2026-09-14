// src/websocket/websocket.module.ts

import { Module } from '@nestjs/common';
import { WebsocketGateway } from './socket.service';

@Module({
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
