import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateCourseCommand } from '../impl/update-course.command';
import { Course } from '../../entities/course.entity';
import { DiversityIndexService } from '../../services/diversity-index.service';

@CommandHandler(UpdateCourseCommand)
export class UpdateCourseHandler
  implements ICommandHandler<UpdateCourseCommand>
{
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly diversityIndexService: DiversityIndexService,
  ) {}

  async execute(command: UpdateCourseCommand): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: command.courseId },
      relations: ['students'],
    });

    if (!course) {
      throw new NotFoundException('No se encontró el curso');
    }

    if (
      command.maxCapacity !== undefined &&
      command.maxCapacity < course.students.length
    ) {
      throw new BadRequestException(
        `El nuevo cupo máximo (${command.maxCapacity}) no puede ser menor al número actual de estudiantes (${course.students.length})`,
      );
    }

    if (command.name !== undefined) course.name = command.name;
    if (command.description !== undefined)
      course.description = command.description;
    if (command.maxCapacity !== undefined)
      course.maxCapacity = command.maxCapacity;

    const updatedCourse = await this.courseRepository.save(course);

    this.diversityIndexService.invalidateCache(updatedCourse.id);

    return updatedCourse;
  }
}
