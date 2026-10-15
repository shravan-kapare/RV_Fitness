import { prisma } from '../../config/database';
import { ExpenseCategory } from '@prisma/client';
import { generateExpenseNumber } from '../../shared/numberGenerator';
import { NotFoundError } from '../../shared/errors';
import { AuditService } from '../billing/audit/audit.service';

export interface CreateExpenseInput {
  category: ExpenseCategory;
  title: string;
  description?: string;
  amountPaisa: bigint;
  expenseDate: Date;
  paymentMethod?: string;
  referenceNumber?: string;
  recordedBy: string;
}

export class ExpenseService {
  public static async create(input: CreateExpenseInput) {
    const expenseNumber = await generateExpenseNumber();

    const expense = await prisma.expense.create({
      data: {
        expenseNumber,
        category: input.category,
        title: input.title,
        description: input.description,
        amountPaisa: input.amountPaisa,
        expenseDate: input.expenseDate,
        paymentMethod: input.paymentMethod || 'BANK_TRANSFER',
        referenceNumber: input.referenceNumber,
        recordedBy: input.recordedBy,
      },
      include: {
        recorder: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    await AuditService.log({
      userId: input.recordedBy,
      action: 'EXPENSE_RECORDED',
      entityType: 'Expense',
      entityId: expense.id,
      newValues: {
        expenseNumber: expense.expenseNumber,
        title: expense.title,
        amountPaisa: expense.amountPaisa.toString(),
        category: expense.category,
      },
    });

    return expense;
  }

  public static async findAll(
    filters: {
      category?: ExpenseCategory;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
    pagination: { skip: number; take: number }
  ) {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.startDate || filters.endDate) {
      where.expenseDate = {};
      if (filters.startDate) where.expenseDate.gte = filters.startDate;
      if (filters.endDate) where.expenseDate.lte = filters.endDate;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { expenseNumber: { contains: filters.search } },
        { referenceNumber: { contains: filters.search } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { expenseDate: 'desc' },
        include: {
          recorder: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
    ]);

    return { total, items };
  }

  public static async findById(id: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        recorder: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!expense) throw new NotFoundError('Expense record not found');
    return expense;
  }

  public static async delete(id: string, userId: string) {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Expense record not found');

    await prisma.expense.delete({ where: { id } });

    await AuditService.log({
      userId,
      action: 'EXPENSE_DELETED',
      entityType: 'Expense',
      entityId: id,
      oldValues: {
        expenseNumber: existing.expenseNumber,
        amountPaisa: existing.amountPaisa.toString(),
      },
    });

    return { success: true };
  }

  public static async getSummary(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = startDate;
      if (endDate) where.expenseDate.lte = endDate;
    }

    const expenses = await prisma.expense.findMany({
      where,
      select: {
        category: true,
        amountPaisa: true,
      },
    });

    let totalPaisa = BigInt(0);
    const categoryTotals: Record<string, bigint> = {};

    for (const item of expenses) {
      totalPaisa += item.amountPaisa;
      categoryTotals[item.category] = (categoryTotals[item.category] || BigInt(0)) + item.amountPaisa;
    }

    return {
      totalExpensePaisa: totalPaisa,
      categoryBreakdown: Object.entries(categoryTotals).map(([cat, paisa]) => ({
        category: cat,
        amountPaisa: paisa,
      })),
    };
  }
}
