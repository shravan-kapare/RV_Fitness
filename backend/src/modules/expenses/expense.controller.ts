import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from './expense.service';
import { AuthenticatedRequest } from '../../types';
import { parsePaginationParams, buildPaginationResponse } from '../../shared/pagination';
import { ExpenseCategory } from '@prisma/client';

export class ExpenseController {
  public static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { category, title, description, amountPaisa, amountRupees, expenseDate, paymentMethod, referenceNumber } = req.body;

      const finalAmountPaisa = amountPaisa 
        ? BigInt(amountPaisa) 
        : amountRupees 
          ? BigInt(Math.round(Number(amountRupees) * 100)) 
          : BigInt(0);

      const expense = await ExpenseService.create({
        category: category as ExpenseCategory,
        title,
        description,
        amountPaisa: finalAmountPaisa,
        expenseDate: new Date(expenseDate || Date.now()),
        paymentMethod,
        referenceNumber,
        recordedBy: req.user!.id,
      });

      res.status(201).json({
        success: true,
        data: expense,
        message: 'Expense recorded successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, take } = parsePaginationParams(req.query);
      const { category, startDate, endDate, search } = req.query;

      const result = await ExpenseService.findAll(
        {
          category: category ? (category as ExpenseCategory) : undefined,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          search: search as string,
        },
        { skip, take }
      );

      res.status(200).json(buildPaginationResponse(result.items, result.total, page, limit));
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await ExpenseService.findById(req.params.id);
      res.status(200).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await ExpenseService.delete(req.params.id, req.user!.id);
      res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const summary = await ExpenseService.getSummary(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}
