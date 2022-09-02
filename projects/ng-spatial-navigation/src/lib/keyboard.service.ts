import { Inject, Injectable, NgZone } from '@angular/core';
import { NavigationService } from './navigation.service';
import { DOCUMENT } from '@angular/common';
import { KeyboardKeysEnum } from './enums/keyboard-keys.enum';

const EXTREME_INTERVAL_REPEAT = 50;

@Injectable()
export class KeyboardService {

  // NOTE: if (repeatInterval < EXTREME_INTERVAL_REPEAT) then we use system repeatInterval (from event with event.repeat property)
  private repeatInterval = 0;

  private pressedKeys: { [key: string]: ReturnType<typeof setInterval> | undefined } = {};

  private needStopEvent: { [key: string]: boolean | undefined } = {};

  private isEnabled = true;

  private readonly keyDownListener: (event: KeyboardEvent | any) => void;

  private readonly keyUpListener: (event: KeyboardEvent | any) => void;

  private rootElement: HTMLElement | undefined;

  get elementListener() {
    if (this.rootElement) {
      return this.rootElement
    } else {
      return this.document
    }
  }

  constructor(
    private zone: NgZone,
    private navigationService: NavigationService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.keyDownListener = this.keyListener.bind(this, true);
    this.keyUpListener = this.keyListener.bind(this, false);
  }

  setStatus(value: boolean) {
    this.isEnabled = value;
  }

  deleteRoot(root: HTMLElement) {
    this.document.removeEventListener('keydown', this.keyDownListener, true);
    this.document.removeEventListener('keyup', this.keyUpListener, true);
    this.rootElement = undefined;
  }

  setRoot(root: HTMLElement, global: boolean) {
    this.rootElement = global ? root : undefined;
    this.zone.runOutsideAngular(() => {
      this.document.addEventListener('keydown', this.keyDownListener, true);
      this.document.addEventListener('keyup', this.keyUpListener, true);
    });
  }

  private doAction(code: string, isShift: boolean): boolean {
    switch (code) {
      case "ArrowUp":
        return this.navigationService.navigate('up');
      case "ArrowRight":
        return this.navigationService.navigate('right')
      case "ArrowDown":
        return this.navigationService.navigate('down')
      case "ArrowLeft":
        return this.navigationService.navigate('left')
      case "Tab":
        return this.navigationService.navigate(isShift ? 'tabshift' : 'tab')
      case "Enter":
        const nativeElement = this.navigationService.focusedNavItem?.el?.nativeElement;
        if (nativeElement) {
          nativeElement.click();
          return true
        } else {
          return false
        }
      default:
        return false
    }
  }

  private keyRepeat(event: KeyboardEvent) {
    this.needStopEvent[event.code] = this.doAction(event.code, event.shiftKey);
  }

  private keyListener(isDown: boolean, event: KeyboardEvent) {
    if (!(event.keyCode in KeyboardKeysEnum) || !this.isEnabled) {
      return
    }
    event.preventDefault()
    const nativeRepeatMode = this.repeatInterval < EXTREME_INTERVAL_REPEAT;
    if ((!nativeRepeatMode && event.repeat) && this.needStopEvent[event.code]) {
      event.stopImmediatePropagation();
      return
    }
    if (!nativeRepeatMode && event.repeat) {
      return
    }
    if (!nativeRepeatMode) {
      if (isDown) {
        if (this.pressedKeys[event.code]) {
          clearInterval(this.pressedKeys[event.code]);
          this.pressedKeys[event.code] = undefined;
        }
        /**
         * TODO: Первое повторение происходит с задержкой + интервал, а потом только интервал
         *       DOWN.......REPEAT...REPEAT...REPEAT.UP
         *       так построен оригинальный REPEAT
         */
        this.pressedKeys[event.code] = setInterval(() => this.keyRepeat(event), this.repeatInterval)
      } else {
        if (this.pressedKeys[event.code]) {
          clearInterval(this.pressedKeys[event.code]);
          this.pressedKeys[event.code] = undefined;
        }
      }
    }
    if (!isDown) {
      return;
    }
    this.needStopEvent[event.code] = this.doAction(event.code, event.shiftKey);
    if (this.needStopEvent[event.code]) {
      event.stopImmediatePropagation();
    }
  }

}
