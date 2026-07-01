import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// pdfkit is CommonJS-only; default import breaks after Nest compile (pdfkit_1.default).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');

type PdfDocument = InstanceType<typeof PDFDocument>;

const MONTH_NAMES = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

export type RestaurantPeriodStats = {
  periodLabel: string;
  periodFrom: Date;
  periodTo: Date;
  ordersCreated: number;
  ordersDelivered: number;
  ordersCancelled: number;
  grossRevenue: number;
  commission: number;
  netRevenue: number;
  averageOrderValue: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
};

@Injectable()
export class TelegramRestaurantStatsService {
  private readonly statsCooldownMs = 60 * 60 * 1000;
  private readonly lastStatsSentAt = new Map<string, number>();

  constructor(private prisma: PrismaService) {}

  getPreviousMonthRange(now = new Date()): { from: Date; to: Date; label: string } {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const label = `${MONTH_NAMES[from.getMonth()]} ${from.getFullYear()}`;
    return { from, to, label };
  }

  canRequestStats(chatId: string): boolean {
    const last = this.lastStatsSentAt.get(chatId.trim());
    if (!last) return true;
    return Date.now() - last >= this.statsCooldownMs;
  }

  markStatsSent(chatId: string): void {
    this.lastStatsSentAt.set(chatId.trim(), Date.now());
  }

  async getLastMonthStats(businessId: string): Promise<RestaurantPeriodStats> {
    const { from, to, label } = this.getPreviousMonthRange();
    const baseWhere: Prisma.OrderWhereInput = {
      businessId,
      deletedAt: null,
    };

    const deliveredWhere: Prisma.OrderWhereInput = {
      ...baseWhere,
      status: OrderStatus.DELIVERED,
      deliveredAt: { gte: from, lte: to },
    };

    const [ordersCreated, ordersDeliveredAgg, ordersCancelled, topProducts] = await Promise.all([
      this.prisma.order.count({
        where: { ...baseWhere, createdAt: { gte: from, lte: to } },
      }),
      this.prisma.order.aggregate({
        where: deliveredWhere,
        _sum: { subtotal: true, commissionAmount: true },
        _count: { _all: true },
      }),
      this.prisma.order.count({
        where: {
          ...baseWhere,
          status: OrderStatus.CANCELLED,
          createdAt: { gte: from, lte: to },
        },
      }),
      this.prisma.orderItem.groupBy({
        by: ['name'],
        where: {
          order: deliveredWhere,
        },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
    ]);

    const grossRevenue = Number(ordersDeliveredAgg._sum.subtotal ?? 0);
    const commission = Number(ordersDeliveredAgg._sum.commissionAmount ?? 0);
    const ordersDelivered = ordersDeliveredAgg._count._all;

    return {
      periodLabel: label,
      periodFrom: from,
      periodTo: to,
      ordersCreated,
      ordersDelivered,
      ordersCancelled,
      grossRevenue,
      commission,
      netRevenue: grossRevenue - commission,
      averageOrderValue: ordersDelivered > 0 ? grossRevenue / ordersDelivered : 0,
      topProducts: topProducts.map((row) => ({
        name: row.name,
        quantity: Number(row._sum.quantity ?? 0),
        revenue: Number(row._sum.subtotal ?? 0),
      })),
    };
  }

  async generatePdf(
    businessName: string,
    stats: RestaurantPeriodStats,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const doc = new PDFDocument({ margin: 48, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const finished = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    doc.fontSize(20).text('FoodApp — Restoran statistikasi', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text(businessName, { align: 'center' });
    doc.fontSize(11).fillColor('#555555').text(stats.periodLabel, { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown(1.2);

    this.drawSectionTitle(doc, 'Umumiy ko\'rsatkichlar');
    this.drawRow(doc, 'Jami buyurtmalar', String(stats.ordersCreated));
    this.drawRow(doc, 'Yetkazilgan buyurtmalar', String(stats.ordersDelivered));
    this.drawRow(doc, 'Bekor qilingan', String(stats.ordersCancelled));
    this.drawRow(doc, 'Jami daromad', this.formatMoney(stats.grossRevenue));
    this.drawRow(doc, 'Komissiya', this.formatMoney(stats.commission));
    this.drawRow(doc, 'Sof daromad', this.formatMoney(stats.netRevenue));
    this.drawRow(doc, 'O\'rtacha buyurtma', this.formatMoney(stats.averageOrderValue));

    doc.moveDown(0.8);
    this.drawSectionTitle(doc, 'Eng ko\'p sotilgan mahsulotlar');

    if (!stats.topProducts.length) {
      doc.fontSize(11).text('Bu davrda yetkazilgan buyurtmalar yo\'q.');
    } else {
      doc.fontSize(10);
      stats.topProducts.forEach((product, index) => {
        doc.text(
          `${index + 1}. ${product.name} — ${product.quantity} dona, ${this.formatMoney(product.revenue)}`,
        );
      });
    }

    doc.moveDown(1.2);
    doc
      .fontSize(9)
      .fillColor('#777777')
      .text(`Yaratilgan: ${this.formatDateTime(new Date())}`, { align: 'right' });

    doc.end();
    const buffer = await finished;
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    const monthKey = `${stats.periodFrom.getFullYear()}-${String(stats.periodFrom.getMonth() + 1).padStart(2, '0')}`;
    return { buffer, filename: `statistika-${slug || 'restoran'}-${monthKey}.pdf` };
  }

  private drawSectionTitle(doc: PdfDocument, title: string): void {
    doc.fontSize(13).fillColor('#000000').text(title);
    doc.moveDown(0.4);
  }

  private drawRow(doc: PdfDocument, label: string, value: string): void {
    doc.fontSize(11).text(`${label}: ${value}`);
  }

  private formatMoney(value: number): string {
    return `${Math.round(value).toLocaleString('uz-UZ')} so'm`;
  }

  private formatDateTime(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
