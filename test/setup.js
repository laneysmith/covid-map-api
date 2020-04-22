global.console = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: jest.fn(),
  debug: console.debug,
};
