export class CreateCourseCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly maxCapacity: number,
  ) {}
}
