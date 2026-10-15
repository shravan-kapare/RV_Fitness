import { Request, Response, NextFunction } from 'express';
import { CmsService } from './cms.service';
import { GalleryCategory, DiscountType, InquiryStatus } from '@prisma/client';

export class CmsController {
  // Events
  public static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const all = req.query.all === 'true';
      const events = await CmsService.getEvents(all);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  public static async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await CmsService.createEvent({
        ...req.body,
        eventDate: new Date(req.body.eventDate),
      });
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  public static async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body };
      if (data.eventDate) data.eventDate = new Date(data.eventDate);
      const event = await CmsService.updateEvent(req.params.id, data);
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      await CmsService.deleteEvent(req.params.id);
      res.status(200).json({ success: true, message: 'Event deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Gallery
  public static async getGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as GalleryCategory | undefined;
      const all = req.query.all === 'true';
      const items = await CmsService.getGallery(category, all);
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  public static async createGalleryPost(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await CmsService.createGalleryPost(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  public static async updateGalleryPost(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await CmsService.updateGalleryPost(req.params.id, req.body);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteGalleryPost(req: Request, res: Response, next: NextFunction) {
    try {
      await CmsService.deleteGalleryPost(req.params.id);
      res.status(200).json({ success: true, message: 'Gallery item deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Offers
  public static async getOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const all = req.query.all === 'true';
      const offers = await CmsService.getOffers(!all);
      res.status(200).json({ success: true, data: offers });
    } catch (error) {
      next(error);
    }
  }

  public static async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await CmsService.createOffer({
        ...req.body,
        validFrom: new Date(req.body.validFrom),
        validTo: new Date(req.body.validTo),
      });
      res.status(201).json({ success: true, data: offer });
    } catch (error) {
      next(error);
    }
  }

  public static async updateOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body };
      if (data.validFrom) data.validFrom = new Date(data.validFrom);
      if (data.validTo) data.validTo = new Date(data.validTo);
      const offer = await CmsService.updateOffer(req.params.id, data);
      res.status(200).json({ success: true, data: offer });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteOffer(req: Request, res: Response, next: NextFunction) {
    try {
      await CmsService.deleteOffer(req.params.id);
      res.status(200).json({ success: true, message: 'Offer deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Inquiries
  public static async submitInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const inquiry = await CmsService.submitInquiry(req.body);
      res.status(201).json({ success: true, data: inquiry, message: 'Inquiry submitted successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async getInquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as InquiryStatus | undefined;
      const inquiries = await CmsService.getInquiries(status);
      res.status(200).json({ success: true, data: inquiries });
    } catch (error) {
      next(error);
    }
  }

  public static async updateInquiryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const inquiry = await CmsService.updateInquiryStatus(req.params.id, status as InquiryStatus);
      res.status(200).json({ success: true, data: inquiry });
    } catch (error) {
      next(error);
    }
  }
}
