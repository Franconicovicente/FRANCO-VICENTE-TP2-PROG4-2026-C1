import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleName',
  standalone: true
})
export class RoleNamePipe implements PipeTransform {
  transform(role: string): string {
    const roles: { [key: string]: string } = {
      'administrador': 'Administrador',
      'usuario': 'Usuario Regular'
    };
    return roles[role] || role;
  }
}