class Request {

  constructor(url, body) {

    if(typeof window === undefined) {
      this.url = 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local' + url;
    }else {
      this.url = window.location.origin + url;
    }

    // this.url = 'http://localhost:3001' + url;
    this.body = body;

    this._json = false;

    this.contentType = 'text/html';
    this.method = 'POST';

    this.cookies = '';

  }

  post() {
    this.method = 'POST';
    return this;
  }

  get() {
    this.method = 'GET';
    return this;
  }

  put() {
    this.method = 'PUT';
    return this;
  }

  delete() {
    this.method = 'DELETE';
    return this;
  }

  patch() {
    this.method = 'PATCH';
    return this;
  }

  json() {
    this.body = JSON.stringify(this.body);
    this._json = true;
    this.contentType = 'application/json';
    return this;
  }

  cookie(obj) {

    let text = "";

    for(let key in obj) {

      text += key + "=" + obj[key] + ';';

    }

    this.cookies = text;

    return this;

  }

  async send() {

    let response;

    const res = await fetch(this.url, {
      method: this.method,
      body: this.body,
      headers: {
        'Content-Type': this.contentType,
        'Cookie': this.cookies
      },
      credentials: "include"
    })

    response = res;

    if(this._json) {
      response = await res.json();
      response._response = res;
      response._isJSON = true;
    }else {
      response._isJSON = false;
    }

    return response;

  }


}

export default Request;
