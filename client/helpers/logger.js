class Logger {

  constructor(page) {
    this.page = page;
    this.yellow = '\x1b[33m';
    this.blue = '\x1b[34m';
    this.red = '\x1b[31m';
    this.purple = "\x1b[35m";
    this.reset = '\x1b[0m';
  }

  warn() {
    console.log(`[${this.yellow}WARN${this.reset}] in (${this.purple}${this.page}${this.reset}):`, ...arguments)
  }

  log() {
    console.log(`[${this.blue}DEBUG${this.reset}]`, ...arguments);
  }

  err() {
    console.log(`[${this.red}ERR${this.reset}]`, ...arguments)
  }

}

export default Logger;
