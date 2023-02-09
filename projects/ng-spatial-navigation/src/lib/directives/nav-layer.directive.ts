import { Directive, forwardRef } from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NavListDirective } from './nav-list.directive';

import { NAV_LAYER_TOKEN } from '../token/nav-layer.token';
import { DIRECTIONS } from '../types/direction.type';

@Directive({
  selector: '[navLayer]',
  providers: [
    {
      provide: NAV_ITEM_TOKEN,
      useExisting: forwardRef(() => NavLayerDirective),
    },
    {
      provide: NAV_LAYER_TOKEN,
      useExisting: forwardRef(() => NavLayerDirective),
    },
  ],
})
export class NavLayerDirective extends NavListDirective {
  override type = 'layer';

  subLayers: NavLayerDirective[] = [];

  override initNavItem() {
    for (const direction of DIRECTIONS) {
      this.internalDirections[direction] = {
        type: 'block',
        reason: 'Дальше нельзя - граница слоя',
      };
    }
  }

  registerLayer(layer: NavLayerDirective): void {
    this.subLayers.push(layer);
  }

  unregisterLayer(layer: NavLayerDirective): void {
    if (this.memory === layer) {
      this.memory = this.findReplaceForChild(layer);
    }
    this.subLayers = this.subLayers.filter((l) => l !== layer);
  }

  override appearance() {
    if (this.parentLayer) {
      this.parentLayer.registerLayer(this);
    }
    this.navigationService.registerLayer(this);
    this.navigationService.navItemAppeared(this);
  }

  override disappearance() {
    if (this.parentLayer) {
      this.parentLayer.unregisterLayer(this);
    }
    this.navigationService.unregisterLayer(this);
    this.navigationService.navItemDisappeared(this);
  }
}
