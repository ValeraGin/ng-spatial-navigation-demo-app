import { InjectionToken } from '@angular/core';

/**
 * Токен NavItem который нужен, чтобы дети знали кто его родитель
 */
export const NAV_ITEM_TOKEN = new InjectionToken('Navigation token');
