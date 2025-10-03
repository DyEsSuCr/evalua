import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

export class AddStudentDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del estudiante es requerido' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;
}
