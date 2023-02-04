import { Inject, Injectable, NgZone } from '@angular/core';
import { NavigationService } from './navigation.service';
import { DOCUMENT } from '@angular/common';
import { KeyboardKeysEnum } from './enums/keyboard-keys.enum';

const EXTREME_INTERVAL_REPEAT = 50;

/** @dynamic */
@Injectable()
export class KeyboardService {
  // NOTE: if (repeatInterval < EXTREME_INTERVAL_REPEAT) then we use system repeatInterval (from event with event.repeat property)
  private repeatInterval = 0;

  /**
   * Список нажатых клавиш
   */
  private pressedKeys: {
    [key: string]: ReturnType<typeof setInterval> | undefined;
  } = {};

  /**
   * Список клавиш действие которых нужно остановить (stopPropagation)
   */
  private needStopEvent: { [key: string]: boolean | undefined } = {};

  /**
   * флаг включения/выключения обработки клавиш
   */
  private isEnabled = true;

  private readonly keyDownListener: (event: KeyboardEvent | any) => void;

  private readonly keyUpListener: (event: KeyboardEvent | any) => void;

  private documentListenerCount = 0;

  constructor(
    private zone: NgZone,
    private navigationService: NavigationService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.keyDownListener = this.keyListener.bind(this, true);
    this.keyUpListener = this.keyListener.bind(this, false);
  }

  setStatus(value: boolean): void {
    this.isEnabled = value;
  }

  deleteRoot(root: HTMLElement, global: boolean): void {
    const elementForListen = global ? this.document : root;
    if (global) {
      this.documentListenerCount--;
    }
    elementForListen.removeEventListener('keydown', this.keyDownListener, true);
    elementForListen.removeEventListener('keyup', this.keyUpListener, true);
  }

  setRoot(root: HTMLElement, global: boolean): void {
    const elementForListen = global ? this.document : root;
    if (global) {
      this.documentListenerCount++;
    }
    if (this.documentListenerCount > 1) {
      console.warn('More than one root listener is defined! It can cause problems. May be you need to add global parameter?');
    }
    this.zone.runOutsideAngular(() => {
      elementForListen.addEventListener('keydown', this.keyDownListener, true);
      elementForListen.addEventListener('keyup', this.keyUpListener, true);
    });
  }

  private doAction(keyCode: number, isShift: boolean): boolean {
    switch (keyCode) {
      case KeyboardKeysEnum.UP:
        return this.navigationService.navigate('up');
      case KeyboardKeysEnum.RIGHT:
        return this.navigationService.navigate('right');
      case KeyboardKeysEnum.DOWN:
        return this.navigationService.navigate('down');
      case KeyboardKeysEnum.LEFT:
        return this.navigationService.navigate('left');
      case KeyboardKeysEnum.TAB:
        return this.navigationService.navigate(isShift ? 'tabshift' : 'tab');
      case KeyboardKeysEnum.ENTER:
        const nativeElement =
          this.navigationService.focusedNavItem?.el?.nativeElement;
        if (nativeElement) {
          nativeElement.click();
          return true;
        } else {
          return false;
        }
        case KeyboardKeysEnum.BACKSPACE:
          return this.navigationService.back()
      default:
        return false;
    }
  }

  private keyRepeat(event: KeyboardEvent): void {
    this.needStopEvent[event.code] = this.doAction(event.keyCode, event.shiftKey);
  }

  private keyListener(isDown: boolean, event: KeyboardEvent): void {
    if (!(event.keyCode in KeyboardKeysEnum) || !this.isEnabled) {
      return;
    }
    event.preventDefault();
    const nativeRepeatMode = this.repeatInterval < EXTREME_INTERVAL_REPEAT;
    if (!nativeRepeatMode && event.repeat && this.needStopEvent[event.code]) {
      event.stopImmediatePropagation();
      return;
    }
    if (!nativeRepeatMode && event.repeat) {
      return;
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
        this.pressedKeys[event.code] = setInterval(
          () => this.keyRepeat(event),
          this.repeatInterval
        );
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
    this.needStopEvent[event.code] = this.doAction(event.keyCode, event.shiftKey);
    if (this.needStopEvent[event.code]) {
      event.stopImmediatePropagation();
    }
  }
}
