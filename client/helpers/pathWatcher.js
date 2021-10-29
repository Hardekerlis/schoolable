class _PathWatcher {

  constructor() {
    this.prevPaths = ['/'];
  }

  update(path) {
    if(this.prevPaths[this.prevPaths.length-1] !== path) {
      this.prevPaths.push(path);
    }
  }

  getPrev() {
    return this.prevPaths[this.prevPaths.length-1];
  }

}

const PathWatcher = new _PathWatcher();

export default PathWatcher;
