import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusText',
  standalone: true
})
export class StatusTextPipe implements PipeTransform {
  transform(eliminado: boolean): string {
    return eliminado ? 'Deshabilitado' : 'Activo';
  }
}