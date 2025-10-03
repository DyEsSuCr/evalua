import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AddStudentCommand } from '../impl/add-student.command';
import { Course } from '../../entities/course.entity';
import { Student } from '../../entities/student.entity';
import { DiversityIndexService } from '../../services/diversity-index.service';

@CommandHandler(AddStudentCommand)
export class AddStudentHandler implements ICommandHandler<AddStudentCommand> {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly diversityIndexService: DiversityIndexService,
  ) {}

  async execute(command: AddStudentCommand): Promise<Student> {
    const course = await this.courseRepository.findOne({
      where: { id: command.courseId },
      relations: ['students'],
    });

    if (!course) {
      throw new NotFoundException('No se encontró el curso');
    }

    if (course.students.length >= course.maxCapacity) {
      throw new BadRequestException('Cupo máximo alcanzado');
    }

    const existingStudent = await this.studentRepository.findOne({
      where: {
        email: command.email,
        course: { id: command.courseId },
      },
    });

    if (existingStudent) {
      throw new ConflictException(
        'Ya existe un estudiante con ese email en este curso',
      );
    }

    const student = this.studentRepository.create({
      name: command.name,
      email: command.email,
      course: { id: command.courseId },
    });

    const savedStudent = await this.studentRepository.save(student);

    this.diversityIndexService.invalidateCache(course.id);

    return savedStudent;
  }
}
