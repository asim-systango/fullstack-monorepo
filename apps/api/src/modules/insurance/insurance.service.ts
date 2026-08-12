import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceClaim, InsuranceClaimStatus } from './entities/insurance-claim.entity';
import { CreateInsuranceClaimDto } from './dto/create-insurance-claim.dto';
import { JwtUser } from '../../common/auth';

@Injectable()
export class InsuranceService {
  constructor(
    @InjectRepository(InsuranceClaim)
    private readonly claimRepository: Repository<InsuranceClaim>,
  ) {}

  async createClaim(
    user: JwtUser | undefined,
    dto: CreateInsuranceClaimDto,
  ): Promise<InsuranceClaim> {
    if (!user) {
      throw new UnauthorizedException(
        'Authentication required to submit insurance claim',
      );
    }

    const existing = await this.claimRepository.findOne({
      where: { appointmentId: dto.appointmentId },
    });
    if (existing) {
      throw new ConflictException(
        `An insurance claim already exists for appointment ID "${dto.appointmentId}"`,
      );
    }

    // Default policy: 80% covered amount, 20% patient co-pay
    const claimAmt = Number(dto.claimAmount);
    const coveredAmount = Math.round(claimAmt * 0.8 * 100) / 100;
    const copayAmount = Math.round((claimAmt - coveredAmount) * 100) / 100;

    const claim = this.claimRepository.create({
      appointmentId: dto.appointmentId,
      patientId: user.id,
      providerName: dto.providerName,
      policyNumber: dto.policyNumber,
      claimAmount: claimAmt,
      coveredAmount,
      copayAmount,
      status: InsuranceClaimStatus.SUBMITTED,
    });

    return this.claimRepository.save(claim);
  }

  async findAll(user?: JwtUser): Promise<InsuranceClaim[]> {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (user.role === 'ADMIN') {
      return this.claimRepository.find({
        relations: ['appointment'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.claimRepository.find({
      where: { patientId: user.id },
      relations: ['appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    user: JwtUser | undefined,
    status: InsuranceClaimStatus | string,
    notes?: string,
    coveredAmount?: number,
  ): Promise<InsuranceClaim> {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only Administrators can process insurance claims');
    }

    const claim = await this.claimRepository.findOne({ where: { id } });
    if (!claim) {
      throw new NotFoundException(`Insurance claim with ID "${id}" not found`);
    }

    claim.status = status;
    if (notes !== undefined) {
      claim.notes = notes;
    }

    if (coveredAmount !== undefined && coveredAmount >= 0) {
      claim.coveredAmount = Number(coveredAmount);
      claim.copayAmount = Math.max(0, Number(claim.claimAmount) - Number(coveredAmount));
    }

    return this.claimRepository.save(claim);
  }
}
