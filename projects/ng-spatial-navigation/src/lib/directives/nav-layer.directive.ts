import { Directive, forwardRef } from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NavItem } from '../types/nav-item.type';
import { NavListDirective } from './nav-list.directive';

import { NAV_LAYER_TOKEN } from '../token/nav-layer.token';
import { BlockNavigation } from "../types/directions.type";

const layerBlockNavigationToken: BlockNavigation = {
  type: 'block',
  reason: 'Дальше нельзя - граница слоя',
};

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
  override up = layerBlockNavigationToken;

  override right = layerBlockNavigationToken;

  override down = layerBlockNavigationToken;

  override left = layerBlockNavigationToken;

  prevMemory?: NavItem;

  subLayers: NavLayerDirective[] = [];

  override findReplace(deletedItem: NavItem): NavItem | undefined {
    const findReplace = super.findReplace(deletedItem);
    return findReplace || this.prevMemory;
  }

  registerLayer(layer: NavLayerDirective): void {
    this.subLayers.push(layer);
  }

  unregisterLayer(layer: NavLayerDirective): void {
    const index = this.subLayers.indexOf(layer);
    this.subLayers.splice(index, 1);
  }

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    if (this.parentLayer) {
      this.parentLayer.registerLayer(this);
    }
    this.prevMemory = this.parent?.memory;
    this.navigationService.focusWithFind(this);
  }

  override ngOnDestroy(): void {
    if (this.parentLayer) {
      this.parentLayer.unregisterLayer(this);
    }
    super.ngOnDestroy();
  }
}
