import { CanActivateFn } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  let roleId = localStorage.getItem('roleId');
  if (roleId == '1')
    return true;
  else
    return false;
};
