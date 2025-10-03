import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetAllCoursesQuery } from '../impl/get-all-courses.query';
import { Course } from '../../entities/course.entity';
import { DiversityIndexService } from '../../services/diversity-index.service';
import { CourseResponse } from './get-course.handler';

@QueryHandler(GetAllCoursesQuery)
export class GetAllCoursesHandler implements IQueryHandler<GetAllCoursesQuery> {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly diversityIndexService: DiversityIndexService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(query: GetAllCoursesQuery): Promise<CourseResponse[]> {
    const courses = await this.courseRepository.find({
      relations: ['students'],
    });

    return courses.map((course) => {
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
    });
  }
}
