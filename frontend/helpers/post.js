class Post {

  constructor(url, body) {

    this.url = 'http://localhost:3000' + url;
    this.body = body;

    this._json = false;

    this.contentType = 'text/html';

  }

  json() {
    this.body = JSON.stringify(this.body);
    this._json = true;
    this.contentType = 'application/json';
    return this;
  }

  async send() {

    let response;

    const res = await fetch(this.url, {
      method: 'POST',
      body: this.body,
      'Content-Type': this.contentType,
    })

    response = res;

    if(this._json) {
      response = await res.json();
      response._response = res;
    }

    return response;

  }


}

export default Post;
