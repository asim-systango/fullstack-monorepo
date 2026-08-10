import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CheckoutLoanDto } from './dto/checkout-loan.dto';
import type { ListLoansQueryDto } from './dto/list-loans-query.dto';
import { Loan } from './loan.entity';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loans: Repository<Loan>,
  ) {}

  // Scaffold — checkout/return must run in a DB transaction.
  list(_query: ListLoansQueryDto): Promise<{ items: Loan[]; total: number }> {
    return Promise.resolve({ items: [], total: 0 });
  }

  checkout(_dto: CheckoutLoanDto): Promise<Loan> {
    throw new Error('Not implemented');
  }

  returnLoan(_id: string): Promise<Loan> {
    throw new Error('Not implemented');
  }
}
