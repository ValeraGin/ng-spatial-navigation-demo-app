export let debugLog: (...args: any) => void
export let debugError: (...args: any) => void;

export function setDebugLevel(level: 'no_debug' | 'error' | 'info'): void {
  debugLog = () => {};
  debugError = () => {};
  switch (level) {
    // @ts-ignore
    case 'info':
      debugLog = console.log;
    case 'error':
      debugError = console.error;
  }
}

setDebugLevel('info');
