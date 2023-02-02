export let debugLog: (...args: any) => void
export let debugError: (...args: any) => void;

/**
 * Устанавливает уровень логирования
 *
 * @param level - уровень логирования (по умолчанию 'no_debug')
 * @param level.no_debug - не логировать
 * @param level.error - логировать только ошибки
 * @param level.info - логировать ошибки и информационные сообщения
 */
export function setDebugLevel(level: 'no_debug' | 'error' | 'info'): void {
  debugLog = () => {
  };
  debugError = () => {
  };
  switch (level) {
    // @ts-ignore - fallthrough is intended here
    case 'info':
      debugLog = console.log;
    /* FALLTHROUGH */
    case 'error':
      debugError = console.error;
  }
}

setDebugLevel('info');
