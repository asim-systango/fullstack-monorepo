import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from './cloudinary.service';
import { ResumeMeta } from './resume-meta.entity';
import { CreateResumeMetaDto } from './dto/create-resume-meta.dto';
import { UpdateResumeMetaDto } from './dto/update-resume-meta.dto';

@Injectable()
export class ResumeMetaService {
  constructor(
    @InjectRepository(ResumeMeta)
    private readonly resumeMetaRepo: Repository<ResumeMeta>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  create(candidateUserId: string, dto: CreateResumeMetaDto) {
    if (
      dto.cloudinaryPublicId &&
      !dto.cloudinaryPublicId.startsWith(`resumes/${candidateUserId}/`)
    ) {
      throw new BadRequestException(
        'cloudinaryPublicId does not belong to this candidate',
      );
    }
    const resume = this.resumeMetaRepo.create({ ...dto, candidateUserId });
    return this.resumeMetaRepo.save(resume);
  }

  findMine(candidateUserId: string) {
    return this.resumeMetaRepo.find({
      where: { candidateUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOwnedOrThrow(id: string, candidateUserId: string) {
    const resume = await this.resumeMetaRepo.findOne({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    // Ownership check lives here because this method already loads the row.
    if (resume.candidateUserId !== candidateUserId) {
      throw new ForbiddenException('You do not own this resume');
    }
    return resume;
  }

  async update(id: string, candidateUserId: string, dto: UpdateResumeMetaDto) {
    const resume = await this.findOwnedOrThrow(id, candidateUserId);
    Object.assign(resume, dto);
    return this.resumeMetaRepo.save(resume);
  }

  async remove(id: string, candidateUserId: string) {
    const resume = await this.findOwnedOrThrow(id, candidateUserId);
    // Pasted-URL resumes have no remote asset; Cloudinary uploads store public_id for destroy.
    if (resume.cloudinaryPublicId) {
      await this.cloudinaryService.deleteAsset(resume.cloudinaryPublicId);
    }
    await this.resumeMetaRepo.remove(resume);
    return { ok: true };
  }
}
