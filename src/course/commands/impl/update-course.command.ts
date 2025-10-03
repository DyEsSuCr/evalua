export class UpdateCourseCommand {
  constructor(
    public readonly courseId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly maxCapacity?: number,
  ) {}
}
