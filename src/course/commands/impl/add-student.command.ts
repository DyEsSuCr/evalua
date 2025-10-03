export class AddStudentCommand {
  constructor(
    public readonly courseId: string,
    public readonly name: string,
    public readonly email: string,
  ) {}
}
