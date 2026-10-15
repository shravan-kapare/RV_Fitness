import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { CmsService } from '../cms/cms.service';
import { PlanService } from '../plans/plan.service';
import { GalleryCategory } from '@prisma/client';

export class PublicController {
  public static async getHomeData(_req: Request, res: Response, next: NextFunction) {
    try {
      const [plans, trainers, events, gallery, offers, settings] = await Promise.all([
        prisma.membershipPlan.findMany({
          where: { isActive: true },
          include: {
            planBenefits: {
              include: { benefit: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
          orderBy: { pricePaisa: 'asc' },
        }),
        prisma.trainer.findMany({
          where: { isPublished: true },
          include: {
            user: {
              select: { fullName: true, email: true, phone: true },
            },
          },
          orderBy: { experienceYears: 'desc' },
        }),
        prisma.gymEvent.findMany({
          where: { isPublished: true, eventDate: { gte: new Date() } },
          orderBy: { eventDate: 'asc' },
          take: 3,
        }),
        prisma.galleryPost.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
          take: 8,
        }),
        prisma.offerCoupon.findMany({
          where: {
            isActive: true,
            validFrom: { lte: new Date() },
            validTo: { gte: new Date() },
          },
          take: 4,
        }),
        prisma.gymSetting.findMany(),
      ]);

      const settingsMap: Record<string, string> = {};
      for (const s of settings) {
        settingsMap[s.key] = s.value;
      }

      res.status(200).json({
        success: true,
        data: {
          plans: plans.map((p) => PlanService.serializePlan(p)),
          trainers,
          events,
          gallery,
          offers,
          settings: settingsMap,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getPlans(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await prisma.membershipPlan.findMany({
        where: { isActive: true },
        include: {
          planBenefits: {
            include: { benefit: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { pricePaisa: 'asc' },
      });
      res.status(200).json({
        success: true,
        data: plans.map((p) => PlanService.serializePlan(p)),
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getTrainers(_req: Request, res: Response, next: NextFunction) {
    try {
      const trainers = await prisma.trainer.findMany({
        where: { isPublished: true },
        include: {
          user: {
            select: { fullName: true, email: true, phone: true },
          },
        },
        orderBy: { experienceYears: 'desc' },
      });
      res.status(200).json({ success: true, data: trainers });
    } catch (error) {
      next(error);
    }
  }

  public static async getEvents(_req: Request, res: Response, next: NextFunction) {
    try {
      const events = await CmsService.getEvents(false);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  public static async getGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as GalleryCategory | undefined;
      const items = await CmsService.getGallery(category, false);
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  public static async getOffers(_req: Request, res: Response, next: NextFunction) {
    try {
      const offers = await CmsService.getOffers(true);
      res.status(200).json({ success: true, data: offers });
    } catch (error) {
      next(error);
    }
  }

  public static async submitInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const inquiry = await CmsService.submitInquiry(req.body);
      res.status(201).json({
        success: true,
        data: inquiry,
        message: 'Thank you for reaching out! RV Fitness will contact you shortly.',
      });
    } catch (error) {
      next(error);
    }
  }
}
