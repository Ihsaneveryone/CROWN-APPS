/**
 * Performance-optimized logger
 * Disables console.log in production for maximum speed
 */

const IS_PRODUCTION = import.meta.env.PROD || false;

// ⚡ ULTRA LIGHTWEIGHT: Disable ALL logging for max performance
const noop = () => {};

export const logger = {
  log: IS_PRODUCTION ? noop : console.log.bind(console),
  error: console.error.bind(console), // Keep errors
  warn: IS_PRODUCTION ? noop : console.warn.bind(console),
  info: IS_PRODUCTION ? noop : console.info.bind(console),
  debug: IS_PRODUCTION ? noop : console.debug.bind(console),
};

// Override global console for automatic optimization
if (IS_PRODUCTION) {
  // @ts-ignore
  window.console.log = noop;
  // @ts-ignore
  window.console.debug = noop;
  // @ts-ignore
  window.console.info = noop;
}
