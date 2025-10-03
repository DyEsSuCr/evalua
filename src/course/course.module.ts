import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { Course, Student } from './entities';
import { DiversityIndexService } from './services/diversity-index.service';

import {
  CreateCourseHandler,
  UpdateCourseHandler,
  DeleteCourseHandler,
  AddStudentHandler,
  RemoveStudentHandler,
} from './commands/handlers';

import {
  GetCourseHandler,
  GetStudentsHandler,
  GetAllCoursesHandler,
} from './queries/handlers';

const CommandHandlers = [
  CreateCourseHandler,
  UpdateCourseHandler,
  DeleteCourseHandler,
  AddStudentHandler,
  RemoveStudentHandler,
];

const QueryHandlers = [
  GetCourseHandler,
  GetStudentsHandler,
  GetAllCoursesHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Course, Student])],
  controllers: [CourseController],
  providers: [DiversityIndexService, ...CommandHandlers, ...QueryHandlers],
})
export class CourseModule {}
