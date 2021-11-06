//TODO: remove colors. uninstall

// const yellow = ;
const blue = '\x1b[34m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

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

}

// const Logger = {
//   log: function() {
//     console.log(`[${blue}DEBUG${reset}]`, ...arguments);
//   },
//   warn: function() {
//     console.log(`[${yellow}WARN${reset}]`, ...arguments)
//   },
//   err: function() {
//     console.log(`[${red}ERR${reset}]`, ...arguments)
//   }
// }

export default Logger;
