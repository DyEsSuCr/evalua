import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DeleteCourseCommand } from '../impl/delete-course.command';
import { Course } from '../../entities/course.entity';
import { DiversityIndexService } from '../../services/diversity-index.service';

@CommandHandler(DeleteCourseCommand)
export class DeleteCourseHandler
  implements ICommandHandler<DeleteCourseCommand>
{
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly diversityIndexService: DiversityIndexService,
  ) {}

  async execute(command: DeleteCourseCommand): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id: command.courseId },
    });

    if (!course) {
      throw new NotFoundException('No se encontró el curso');
    }

    await this.courseRepository.remove(course);

    this.diversityIndexService.invalidateCache(command.courseId);
  }
}
