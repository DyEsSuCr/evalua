# Backend - Sistema de Gestión de Curso

Backend desarrollado con NestJS usando el patrón CQRS (Command Query Responsibility Segregation) para separar operaciones de lectura y escritura.

## 🏗️ Arquitectura

### Patrón CQRS

El proyecto implementa CQRS para:
- **Separación de responsabilidades**: Commands para escritura, Queries para lectura
- **Escalabilidad**: Permite optimizar operaciones de lectura y escritura independientemente
- **Mantenibilidad**: Código más organizado y fácil de mantener
- **Testing**: Facilita las pruebas unitarias

### Estructura del Proyecto

```
src/
├── course/
│   ├── commands/           # Operaciones de escritura (CREATE, UPDATE, DELETE)
│   │   ├── handlers/       # Lógica de negocio para commands
│   │   └── impl/          # Definición de commands
│   ├── queries/           # Operaciones de lectura (GET)
│   │   ├── handlers/      # Lógica de negocio para queries
│   │   └── impl/         # Definición de queries
│   ├── dto/              # Data Transfer Objects con validación
│   ├── entities/         # Entidades de TypeORM
│   ├── services/         # Servicios (caché de índice de diversidad)
│   ├── course.controller.ts
│   └── course.module.ts
├── common/
│   └── filters/          # Filtros globales para manejo de errores
├── app.module.ts
└── main.ts
```

## 🚀 Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o pnpm

### Paso 1: Clonar e instalar dependencias

```bash
cd backend
npm install
```

### Paso 2: Configurar Base de Datos

Crear una base de datos en PostgreSQL:

```sql
CREATE DATABASE course_management;
```

### Paso 3: Configurar variables de entorno

Copiar el archivo de ejemplo y editarlo:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=3001
NODE_ENV=db

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=course_management

FRONTEND_URL=http://localhost:3000
```

### Paso 4: Iniciar la aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La API estará disponible en `http://localhost:3001`

## 📡 API Endpoints

### Gestión de Cursos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/courses` | Crear curso |
| GET | `/courses` | Listar todos los cursos |
| GET | `/courses/:id` | Obtener curso específico con índice de diversidad |
| PATCH | `/courses/:id` | Actualizar curso |
| DELETE | `/courses/:id` | Eliminar curso |

### Gestión de Estudiantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/courses/:id/students` | Añadir estudiante a un curso |
| GET | `/courses/:id/students` | Listar estudiantes de un curso |
| DELETE | `/courses/:courseId/students/:studentId` | Eliminar estudiante |

### Ejemplos de Uso

#### Crear Curso

```bash
curl -X POST http://localhost:3001/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desarrollo Web Full Stack",
    "description": "Curso completo de desarrollo web",
    "maxCapacity": 30
  }'
```

#### Listar Todos los Cursos

```bash
curl http://localhost:3001/courses
```

Respuesta:
```json
[
  {
    "id": "uuid-1",
    "name": "Desarrollo Web Full Stack",
    "description": "Curso completo de desarrollo web",
    "maxCapacity": 30,
    "currentStudents": 5,
    "diversityIndex": 80.0,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "uuid-2",
    "name": "React Avanzado",
    "description": "Curso de React nivel avanzado",
    "maxCapacity": 20,
    "currentStudents": 3,
    "diversityIndex": 66.67,
    "createdAt": "2024-01-02T00:00:00Z"
  }
]
```

#### Añadir Estudiante a un Curso

```bash
curl -X POST http://localhost:3001/courses/{courseId}/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@gmail.com"
  }'
```

#### Obtener Curso Específico con Índice de Diversidad

```bash
curl http://localhost:3001/courses/{courseId}
```

Respuesta:
```json
{
  "id": "uuid",
  "name": "Desarrollo Web Full Stack",
  "description": "Curso completo de desarrollo web",
  "maxCapacity": 30,
  "currentStudents": 5,
  "diversityIndex": 80.0,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 🎯 Características Especiales

### 1. Índice de Diversidad

Calcula el porcentaje de dominios únicos de email:

```
Índice = (Dominios Únicos / Total Estudiantes) × 100
```

**Ejemplo**:
- 5 estudiantes: `@gmail.com, @gmail.com, @outlook.com, @yahoo.com, @hotmail.com`
- Dominios únicos: 4
- Índice: (4/5) × 100 = 80%

### 2. Caché en Memoria

El servicio `DiversityIndexService` implementa caché inteligente **por curso**:
- Almacena el índice calculado para cada curso independientemente
- Solo recalcula cuando cambian los estudiantes de ese curso específico
- Invalida automáticamente en operaciones CRUD

```typescript
// El caché se invalida automáticamente por curso en:
- Crear/actualizar curso
- Añadir/eliminar estudiantes del curso
```

### 3. Optimización de Base de Datos

Índices creados para mejorar rendimiento:

```typescript
@Index(['courseId']) // En tabla students
```

Esto acelera:
- Búsquedas de estudiantes por curso
- Joins entre Course y Student
- Conteo de estudiantes

### 4. Validación con class-validator

Todos los DTOs tienen validación automática:

```typescript
@IsEmail({}, { message: 'Debe proporcionar un email válido' })
@IsNotEmpty({ message: 'El email es requerido' })
email: string;
```

### 5. Manejo de Errores

Filtro global que formatea todas las respuestas de error:

```json
{
  "statusCode": 400,
  "message": "Cupo máximo alcanzado",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Decisiones Técnicas

### ¿Por qué CQRS?

1. **Separación de Concerns**: Commands y Queries tienen responsabilidades distintas
2. **Escalabilidad**: Podemos optimizar lecturas y escrituras independientemente
3. **Mantenibilidad**: Código más organizado y fácil de testear
4. **Preparado para Event Sourcing**: Si en el futuro necesitamos auditoría completa

### ¿Por qué TypeORM?

- Integración nativa con NestJS
- Soporte completo de TypeScript
- Migraciones automáticas en desarrollo
- Relaciones y cascadas bien implementadas

### Caché Simple vs Redis

**Elegí caché en memoria** porque:
- Simplicidad sobre complejidad innecesaria
- Rendimiento excelente para este caso de uso
- Caché independiente por curso (Map<courseId, CacheEntry>)
- Fácil de escalar si se necesita (migrar a Redis es trivial)

Con la implementación actual, cada curso tiene su propio caché, lo que permite:
- Múltiples cursos sin interferencia
- Invalidación granular por curso
- Excelente rendimiento en consultas frecuentes

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Modelo de Datos

```
Course (1) ─── (N) Student
│
├── id: UUID
├── name: string
├── description: text
├── maxCapacity: int
├── createdAt: timestamp
└── updatedAt: timestamp

Student
├── id: UUID
├── name: string
├── email: string (unique)
├── courseId: UUID (FK, indexed)
└── createdAt: timestamp
```

## 🔒 Validaciones Implementadas

- ✅ Pueden existir múltiples cursos en el sistema
- ✅ Email único por estudiante **dentro de cada curso** (puede repetirse entre cursos)
- ✅ No superar cupo máximo por curso
- ✅ No reducir maxCapacity por debajo del número actual de estudiantes
- ✅ Validación de formato de email
- ✅ Campos requeridos con mensajes descriptivos
- ✅ Validación de existencia de curso al agregar estudiantes
- ✅ Validación de existencia de estudiante al eliminar

## 🚀 Optimizaciones

1. **Base de Datos**: Índice en `courseId` para búsquedas rápidas
2. **Caché**: Índice de diversidad en memoria
3. **Validación**: Pipes globales de NestJS
4. **Error Handling**: Filtro global consistente
5. **TypeScript**: Tipado estricto previene errores en tiempo de desarrollo

## 📝 Scripts Disponibles

```bash
npm run start:dev    # Desarrollo con hot-reload
npm run build        # Compilar para producción
npm run start:prod   # Ejecutar en producción
npm run lint         # Ejecutar linter
npm run format       # Formatear código
```

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verificar que PostgreSQL esté corriendo
- Revisar credenciales en `.env`
- Verificar que la base de datos exista

### Error: "Port 3001 already in use"
- Cambiar PORT en `.env`
- O detener el proceso usando el puerto: `lsof -ti:3001 | xargs kill`

### Error de TypeORM Sync
- En producción, cambiar `synchronize: false` y usar migraciones
- En desarrollo, asegurar que `NODE_ENV=development`
