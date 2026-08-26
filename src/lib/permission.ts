import { Role } from '@prisma/client';

export function canModerate(role: Role) {
  return role === 'ADMIN';
}
export function isAdmin(role: Role) {
  return role === 'ADMIN';
}