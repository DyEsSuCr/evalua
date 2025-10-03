/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCourseDto, UpdateCourseDto, AddStudentDto } from './dto';
import {
  CreateCourseCommand,
  UpdateCourseCommand,
  DeleteCourseCommand,
  AddStudentCommand,
  RemoveStudentCommand,
} from './commands/impl';
import {
  GetCourseQuery,
  GetStudentsQuery,
  GetAllCoursesQuery,
} from './queries/impl';

@Controller('courses')
export class CourseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * POST /courses - Crea un nuevo curso
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    const command = new CreateCourseCommand(
      createCourseDto.name,
      createCourseDto.description,
      createCourseDto.maxCapacity,
    );
    return await this.commandBus.execute(command);
  }

  /**
   * GET /courses - Lista todos los cursos
   */
  @Get()
  async getAllCourses() {
    return await this.queryBus.execute(new GetAllCoursesQuery());
  }

  /**
   * GET /courses/:id - Obtiene un curso específico con su índice de diversidad
   */
  @Get(':id')
  async getCourse(@Param('id') courseId: string) {
    return await this.queryBus.execute(new GetCourseQuery(courseId));
  }

  /**
   * PATCH /courses/:id - Actualiza un curso
   */
  @Patch(':id')
  async updateCourse(
    @Param('id') courseId: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const command = new UpdateCourseCommand(
      courseId,
      updateCourseDto.name,
      updateCourseDto.description,
      updateCourseDto.maxCapacity,
    );
    return await this.commandBus.execute(command);
  }

  /**
   * DELETE /courses/:id - Elimina un curso y todos sus estudiantes
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourse(@Param('id') courseId: string) {
    await this.commandBus.execute(new DeleteCourseCommand(courseId));
  }

  /**
   * POST /courses/:id/students - Añade un estudiante al curso
   */
  @Post(':id/students')
  @HttpCode(HttpStatus.CREATED)
  async addStudent(
    @Param('id') courseId: string,
    @Body() addStudentDto: AddStudentDto,
  ) {
    const command = new AddStudentCommand(
      courseId,
      addStudentDto.name,
      addStudentDto.email,
    );
    return await this.commandBus.execute(command);
  }

  /**
   * GET /courses/:id/students - Lista todos los estudiantes de un curso
   */
  @Get(':id/students')
  async getStudents(@Param('id') courseId: string) {
    return await this.queryBus.execute(new GetStudentsQuery(courseId));
  }

  /**
   * DELETE /courses/:courseId/students/:studentId - Elimina un estudiante del curso
   */
  @Delete(':courseId/students/:studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeStudent(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
  ) {
    const command = new RemoveStudentCommand(studentId);
    await this.commandBus.execute(command);
  }
}
