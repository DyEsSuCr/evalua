import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetStudentsQuery } from '../impl/get-students.query';
import { Course } from '../../entities/course.entity';
import { Student } from '../../entities/student.entity';

@QueryHandler(GetStudentsQuery)
export class GetStudentsHandler implements IQueryHandler<GetStudentsQuery> {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async execute(): Promise<Student[]> {
    const course = await this.courseRepository.findOne({
      where: {},
      relations: ['students'],
    });

    if (!course) {
      throw new NotFoundException('No se encontró el curso');
    }

    return course.students;
  }
}
