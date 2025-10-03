import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetCourseQuery } from '../impl/get-course.query';
import { Course } from '../../entities/course.entity';
import { DiversityIndexService } from '../../services/diversity-index.service';

export interface CourseResponse {
  id: string;
  name: string;
  description: string;
  maxCapacity: number;
  currentStudents: number;
  diversityIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetCourseQuery)
export class GetCourseHandler implements IQueryHandler<GetCourseQuery> {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly diversityIndexService: DiversityIndexService,
  ) {}

  async execute(query: GetCourseQuery): Promise<CourseResponse> {
    const course = await this.courseRepository.findOne({
      where: { id: query.courseId },
      relations: ['students'],
    });

    if (!course) {
      throw new NotFoundException(
        `No se encontró el curso con ID ${query.courseId}`,
      );
    }

    const diversityIndex = this.diversityIndexService.calculateDiversityIndex(
      course.id,
      course.students,
    );

    return {
      id: course.id,
      name: course.name,
      description: course.description,
      maxCapacity: course.maxCapacity,
      currentStudents: course.students.length,
      diversityIndex,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}
