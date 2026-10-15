import { prisma } from '../../config/database';
import { GalleryCategory, DiscountType, InquiryStatus } from '@prisma/client';
import { NotFoundError } from '../../shared/errors';

export class CmsService {
  // ================= EVENTS =================
  public static async getEvents(includeUnpublished = false) {
    return prisma.gymEvent.findMany({
      where: includeUnpublished ? {} : { isPublished: true },
      orderBy: { eventDate: 'asc' },
    });
  }

  public static async getEventBySlug(slug: string) {
    const event = await prisma.gymEvent.findUnique({ where: { slug } });
    if (!event) throw new NotFoundError('Event not found');
    return event;
  }

  public static async createEvent(data: {
    title: string;
    slug: string;
    description: string;
    eventDate: Date;
    location?: string;
    bannerUrl?: string;
    isPublished?: boolean;
  }) {
    return prisma.gymEvent.create({ data });
  }

  public static async updateEvent(id: string, data: Partial<{
    title: string;
    slug: string;
    description: string;
    eventDate: Date;
    location?: string;
    bannerUrl?: string;
    isPublished?: boolean;
  }>) {
    return prisma.gymEvent.update({ where: { id }, data });
  }

  public static async deleteEvent(id: string) {
    return prisma.gymEvent.delete({ where: { id } });
  }

  // ================= GALLERY =================
  public static async getGallery(category?: GalleryCategory, includeUnpublished = false) {
    const where: any = {};
    if (!includeUnpublished) where.isPublished = true;
    if (category) where.category = category;

    return prisma.galleryPost.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  public static async createGalleryPost(data: {
    title: string;
    category: GalleryCategory;
    imageUrl: string;
    caption?: string;
    displayOrder?: number;
    isPublished?: boolean;
  }) {
    return prisma.galleryPost.create({ data });
  }

  public static async updateGalleryPost(id: string, data: Partial<{
    title: string;
    category: GalleryCategory;
    imageUrl: string;
    caption?: string;
    displayOrder?: number;
    isPublished?: boolean;
  }>) {
    return prisma.galleryPost.update({ where: { id }, data });
  }

  public static async deleteGalleryPost(id: string) {
    return prisma.galleryPost.delete({ where: { id } });
  }

  // ================= OFFERS & COUPONS =================
  public static async getOffers(activeOnly = true) {
    const where: any = {};
    if (activeOnly) {
      const now = new Date();
      where.isActive = true;
      where.validFrom = { lte: now };
      where.validTo = { gte: now };
    }
    return prisma.offerCoupon.findMany({
      where,
      orderBy: { validTo: 'asc' },
    });
  }

  public static async createOffer(data: {
    code: string;
    title: string;
    discountType: DiscountType;
    discountValue: number;
    validFrom: Date;
    validTo: Date;
    usageLimit?: number;
  }) {
    return prisma.offerCoupon.create({ data });
  }

  public static async updateOffer(id: string, data: Partial<{
    code: string;
    title: string;
    discountType: DiscountType;
    discountValue: number;
    validFrom: Date;
    validTo: Date;
    usageLimit?: number;
    isActive?: boolean;
  }>) {
    return prisma.offerCoupon.update({ where: { id }, data });
  }

  public static async deleteOffer(id: string) {
    return prisma.offerCoupon.delete({ where: { id } });
  }

  // ================= CONTACT INQUIRIES =================
  public static async submitInquiry(data: {
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) {
    return prisma.contactInquiry.create({
      data: {
        ...data,
        status: InquiryStatus.NEW,
      },
    });
  }

  public static async getInquiries(status?: InquiryStatus) {
    return prisma.contactInquiry.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async updateInquiryStatus(id: string, status: InquiryStatus) {
    return prisma.contactInquiry.update({
      where: { id },
      data: { status },
    });
  }
}
