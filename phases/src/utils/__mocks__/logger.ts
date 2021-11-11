const logger = {
  verbose: jest.fn().mockImplementation((message: string): void => {}),
  debug: jest.fn().mockImplementation((message: string): void => {}),
  info: jest.fn().mockImplementation((message: string): void => {}),
  warn: jest.fn().mockImplementation((message: string): void => {}),
  error: jest.fn().mockImplementation((message: string): void => {}),
};

export default logger;
