import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from '@/helper/file.service';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import {startOfYear , endOfYear ,  startOfMonth, endOfMonth , startOfWeek, endOfWeek,   startOfDay, endOfDay, subMonths, isValid, parse  } from 'date-fns';
import { OderType, OrderStatus, QuotaStatus, QuotaType } from '@prisma/client';

@Injectable()
export class AnalyticsService {
    constructor(
        private prisma: PrismaService
    ) {}

    convertDateTypeToDate(dateType:string){
        let startDate: Date;
        let endDate: Date;

        switch (dateType) {
          case 'year':
            startDate = startOfYear(new Date());
            endDate = endOfYear(new Date());
            break;
          case 'month':
            startDate = startOfMonth(new Date());
            endDate = endOfMonth(new Date());
            break;
          case 'week':
            startDate = startOfWeek(new Date());
            endDate = endOfWeek(new Date());
            break;
          case 'day':
            startDate = startOfDay(new Date());
            endDate = endOfDay(new Date());
            break;
          default:
            startDate = startOfMonth(new Date());
            endDate = endOfMonth(new Date());
            break;
        }
        return { startDate, endDate };
    }

    async getAnalyticsCard(user: any, query: Record<string, any>) {
      // Helper function to safely parse date
      function parseSafeDate(dateStr: string, format = "dd-MM-yyyy") {
        if (!dateStr) return null;
        const parsed = parse(dateStr, format, new Date());
        return isValid(parsed) ? parsed : null;
      }

      // Parse minDate / maxDate from query
      let minDate = parseSafeDate(query?.minDate, "dd-MM-yyyy");
      let maxDate = parseSafeDate(query?.maxDate, "dd-MM-yyyy");

      // Default to last 1 month if dates missing or invalid
      if (!minDate) minDate = subMonths(new Date(), 1);
      if (!maxDate) maxDate = new Date();

      // Ensure start/end of day
      const startDate = startOfDay(minDate);
      const endDate = endOfDay(maxDate);

      // 1. Total Brands
      const totalBrandCount = await this.prisma.ourBrand.count();

      // 2. Total Save Quotes Requests
      const totalSaveQuotesRequest = await this.prisma.saveQuates.count({
        where: {
          status: { in: [
            QuotaStatus.COMPLETED, 
            QuotaStatus.PENDING, 
            QuotaStatus.APPROVED, 
            QuotaStatus.PURCHASED, 
            QuotaStatus.EXPIRE, 
            QuotaStatus.CANCELLED, 
            QuotaStatus.INACTIVE, 
            QuotaStatus.ACTIVE,
            QuotaStatus.REJECTED
          ] },
          quationType: QuotaType.REQUEST_QUOTATION,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const totalOrder = await this.prisma.saveOrder.count({
        where: {
          orderType: {
            in: [OderType.ONE_TIME_ORDER, OderType.RE_ORDER],
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // 3. Total Supplier Count
      const products = await this.prisma.product.findMany({
        select: { supplierName: true },
      });

      const supplierSet = new Set<string>();
      products.forEach((item) => {
        if (item?.supplierName) supplierSet.add(item.supplierName);
      });

      return {
        totalBrandCount,
        totalSaveQuotesRequest,
        totalSupplierCount: supplierSet.size,
        totalOrder,
        startDate,
        endDate,
      };
    }

    async getChart(user: any, query: Record<string, any>) { 
      const { startDate, endDate } = this.convertDateTypeToDate(query?.dateType);

          // 1. Fetch completed orders
            const orders = await this.prisma.saveOrder.findMany({
              where: {
                status: {
                  in: [
                    OrderStatus.PROCESSING,
                    OrderStatus.PENDING,
                    OrderStatus.COMPLETED,
                    OrderStatus.CANCELLED
                  ],
                },
                orderType: {
                  in: [OderType.ONE_TIME_ORDER, OderType.RE_ORDER],
                },
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              select: {
                productList: true,
                currency: true,
              },
            });

            // 1. Get conversion rates (latest row)
            const [currencyRates] = await this.prisma.currencyControll.findMany({
              orderBy: { createdAt: "desc" },
              take: 1,
            });

            // helper: convert to GBP
            const convertToGBP = (amount: number, fromCurrency: string = "USD") => {
              if (!amount) return 0;

              // Example: if GBP is base
              switch (fromCurrency) {
                case "USD":
                  return (amount / currencyRates.USD) * currencyRates.EUR;
                case "EUR":
                  return (amount / currencyRates.EUR) * currencyRates.EUR;
                default:
                  return (amount / currencyRates.GBP) * currencyRates.EUR;
              }
            };

            // 2. Group sales by product/brand (all in GBP)
            const grouped: Record<string, number> = {};
            orders.forEach(order => {
              const products = (order.productList as any[]) || [];
              products.forEach(product => {
                const brand = product.brand || product.description || product.sku;
                const subtotal = (product.quantity || 0) * (product.unitPrice || 0);
                const subtotalGBP = convertToGBP(subtotal, order.currency);
                if (!grouped[brand]) grouped[brand] = 0;
                  grouped[brand] += subtotalGBP;
                });
            });

            // 3. Convert to frontend list
            const salesByBrand = Object.entries(grouped).map(([brand, totalAmount]) => ({
              brand,
              totalAmount, // always in GBP
            }));

            // 4. Calculate grand total in GBP
            const totalSales = salesByBrand.reduce((sum, b) => sum + b.totalAmount, 0);

            return {
              totalSalesGBP: totalSales,
              salesByBrand,
              ratesUsed: currencyRates,
            };

    }
}



