import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RemoveStudentCommand } from '../impl/remove-student.command';
import { Student } from '../../entities/student.entity';
import { DiversityIndexService } from '../../services/diversity-index.service';

@CommandHandler(RemoveStudentCommand)
export class RemoveStudentHandler
  implements ICommandHandler<RemoveStudentCommand>
{
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly diversityIndexService: DiversityIndexService,
  ) {}

  async execute(command: RemoveStudentCommand): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { id: command.studentId },
      relations: ['course'],
    });

    if (!student) {
      throw new NotFoundException('No se encontró el estudiante');
    }

    const courseId = student.course.id;
    await this.studentRepository.remove(student);

    this.diversityIndexService.invalidateCache(courseId);
  }
}
