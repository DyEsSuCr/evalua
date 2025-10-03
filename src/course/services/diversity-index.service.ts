import { Injectable } from '@nestjs/common';
import { Student } from '../entities/student.entity';

interface CacheEntry {
  index: number;
  emails: string[];
}

@Injectable()
export class DiversityIndexService {
  // Caché por courseId
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Calcula el índice de diversidad basado en los dominios de email de los estudiantes.
   * El índice se cachea en memoria por curso y solo se recalcula cuando los estudiantes cambian.
   *
   * @param courseId - ID del curso
   * @param students - Array de estudiantes
   * @returns Índice de diversidad (0-100)
   */
  calculateDiversityIndex(courseId: string, students: Student[]): number {
    // Si no hay estudiantes, el índice es 0
    if (students.length === 0) {
      this.cache.set(courseId, { index: 0, emails: [] });
      return 0;
    }

    // Obtener emails actuales ordenados
    const currentEmails = students.map((s) => s.email).sort();

    // Verificar si la caché es válida para este curso
    if (this.isCacheValid(courseId, currentEmails)) {
      return this.cache.get(courseId).index;
    }

    // Extraer dominios únicos de los emails
    const domains = students.map((student) => {
      const emailParts = student.email.split('@');
      return emailParts.length > 1 ? emailParts[1].toLowerCase() : '';
    });

    // Filtrar dominios vacíos y obtener únicos
    const uniqueDomains = new Set(domains.filter((domain) => domain !== ''));

    // Calcular índice: (dominios únicos / total estudiantes) * 100
    const diversityIndex = (uniqueDomains.size / students.length) * 100;

    // Redondear a 2 decimales
    const roundedIndex = Math.round(diversityIndex * 100) / 100;

    // Actualizar caché para este curso
    this.cache.set(courseId, {
      index: roundedIndex,
      emails: currentEmails,
    });

    return roundedIndex;
  }

  /**
   * Verifica si la caché es válida para un curso específico
   */
  private isCacheValid(courseId: string, currentEmails: string[]): boolean {
    const cached = this.cache.get(courseId);

    if (!cached) {
      return false;
    }

    if (currentEmails.length !== cached.emails.length) {
      return false;
    }

    // Comparar arrays ordenados
    return currentEmails.every(
      (email, index) => email === cached.emails[index],
    );
  }

  /**
   * Invalida la caché para un curso específico
   */
  invalidateCache(courseId: string): void {
    this.cache.delete(courseId);
  }

  /**
   * Invalida toda la caché (útil para testing)
   */
  invalidateAllCache(): void {
    this.cache.clear();
  }

  /**
   * Obtiene información detallada sobre el cálculo del índice de diversidad
   */
  getDiversityDetails(
    courseId: string,
    students: Student[],
  ): {
    totalStudents: number;
    uniqueDomains: number;
    domains: { domain: string; count: number }[];
    diversityIndex: number;
  } {
    if (students.length === 0) {
      return {
        totalStudents: 0,
        uniqueDomains: 0,
        domains: [],
        diversityIndex: 0,
      };
    }

    // Extraer y contar dominios
    const domainMap = new Map<string, number>();

    students.forEach((student) => {
      const emailParts = student.email.split('@');
      const domain = emailParts.length > 1 ? emailParts[1].toLowerCase() : '';

      if (domain) {
        domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
      }
    });

    const domains = Array.from(domainMap.entries()).map(([domain, count]) => ({
      domain,
      count,
    }));

    const diversityIndex = this.calculateDiversityIndex(courseId, students);

    return {
      totalStudents: students.length,
      uniqueDomains: domainMap.size,
      domains,
      diversityIndex,
    };
  }
}
