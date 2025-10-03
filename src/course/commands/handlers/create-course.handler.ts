import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseCommand } from '../impl/create-course.command';
import { Course } from '../../entities/course.entity';
import { DiversityIndexService } from '../../services/diversity-index.service';

@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler
  implements ICommandHandler<CreateCourseCommand>
{
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly diversityIndexService: DiversityIndexService,
  ) {}

  async execute(command: CreateCourseCommand): Promise<Course> {
    const course = this.courseRepository.create({
      name: command.name,
      description: command.description,
      maxCapacity: command.maxCapacity,
    });

    const savedCourse = await this.courseRepository.save(course);

    this.diversityIndexService.invalidateCache(savedCourse.id);

    return savedCourse;
  }
}
