import { Module } from "@nestjs/common";
import { WebhookController } from "./webhook.controller";
import { WebhookService } from "./webhook.service";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/helper/prisma.service";


@Module({
    controllers: [WebhookController],
    providers: [WebhookService, ConfigService, PrismaService]
})

export class WebhookModule {}