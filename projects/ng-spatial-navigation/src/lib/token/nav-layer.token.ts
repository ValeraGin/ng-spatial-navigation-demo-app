import { InjectionToken } from '@angular/core';

/**
 * Токен слоя который нужен, чтобы дочерние слои знали кто их родитель и могли вернуться к нему при желании
 */
export const NAV_LAYER_TOKEN = new InjectionToken('Navigation layer token');
