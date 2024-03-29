class Post {

  constructor(url, body) {

    this.url = 'http://localhost:3001' + url;
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
      headers: {
        'Content-type': this.contentType,
      },
      credentials: "include"

    })

    response = res;

    if(this._json) {
      response = await res.json();
      response._response = res;
    }

    return response;

  }


}

export {
  Post
}
