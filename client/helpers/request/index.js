import settings from './options.json';

const {
  methods,
  services,
  contentTypes,
  senders
} = settings;

const standardMeta = {
  sent: false,
  response: null,
  isJSON: false
}

const BuildRequest = () => {

  const inner = {
    service: '',

    plus: function(path) {
      this.path = path;
      return this;
    },

    method: 'GET',
    baseUrl: '',
    path: '',
    contentType: 'text/html',
    sender: 'client',

    headers: {},

    meta: Object.create(standardMeta),

    serverContext: null,
    context: function(ctx) {
      this.serverContext = ctx;
      return this;
    },

    cookies: null,
    cookie: function(obj) {
      let text = '';

      for (let key in obj) {
        text += key + '=' + obj[key] + ';';
      }

      this.cookies = text;

      return this;
    },

    bodyData: null,
    body: function(bdy) {
      this.bodyData = bdy;
      return this;
    },

    send: async function() {

      this.meta.sent = true;

      if(this.sender === 'server' && (typeof window === 'undefined' || typeof window === undefined)) {
        this.baseUrl =
          'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local';
      }else {
        this.baseUrl = window.location.origin;
      }

      this.headers = {
        'Content-Type': this.contentType,
        Cookie: this.cookies
      }

      if(this.sender === 'server') this.headers.Host = 'dev.schoolable.se';

      if(this.serverContext && this.sender === 'server') {
        this.headers = Object.assign(this.headers, this.serverContext.req.headers);
      }

      let url = `${this.baseUrl}/api/${this.service}`;

      if(this.path.length !== 0) {
        url += `/${this.path}`;
      }

      if(this.bodyData !== null) {
        if(this.meta.isJSON === true) {
          if(typeof this.bodyData !== 'string') {
            this.bodyData = JSON.stringify(this.bodyData)
          }
        }
      }

      const res = await fetch(url, {
        method: this.method,
        body: this.bodyData,
        headers: this.headers,
        credentials: 'include',
      });

      if(this.meta.isJSON) {
        try {
          this.meta.response = {
            data: await res.json(),
            meta: res
          }
        }catch(err) {
          this.meta.isJSON = true;
        }
      }else {
        this.meta.response = {
          data: 'in meta',
          meta: res
        }
        this.meta.response.data = this.meta.response.meta;
      }

      return this;

    },

    get response() {

      if(this.meta.sent) {
        return this.meta.response;
      }

      return new Promise(async (resolve, reject) => {
        await this.send();
        resolve(this.meta.response);
      })

    }

  }

  //request.result === request.response, cooler synonym
  Object.defineProperty(inner, 'result', {
    get: function() {
      return this.response;
    }
  })

  //synonyms
  inner.b = inner.body;
  inner.bdy = inner.body;

  inner.c = inner.context;
  inner.ctx = inner.context;

  inner.addPath = inner.plus;
  inner.add = inner.plus;

  //change values of send() by a prop on inner.
  //this method sets those props
  const changeByNewProp = (propName, value, getterValue, addMethod) => {
    Object.defineProperty(inner, value, {
      get: function() {
        if(addMethod) addMethod(this);
        this[propName] = (getterValue === undefined) ? value : getterValue;
        return this;
      }
    })
  }

  //buildling senders
  for(let sdr of senders) {
    changeByNewProp('sender', sdr)
  }

  //building contentTypes
  for(let key in contentTypes) {

    if(typeof contentTypes[key] !== 'string') {
      changeByNewProp('contentType', key, contentTypes[key].type, function(reqObj) {
        //this change needs to happen to every individual request
        //not all at start of app
        reqObj.meta.isJSON = true;
      })
    }else {
      changeByNewProp('contentType', key, contentTypes[key])
    }

  }

  //building methods
  for(let mth of methods) {
    changeByNewProp('method', mth, mth.toUpperCase())
  }

  //building services
  for(let srv of services) {
    changeByNewProp('service', srv)
  }

  return inner;

}

const BuiltRequest = BuildRequest();

const Request = () => {
  const newRequest = Object.create(BuiltRequest);
  newRequest.meta = Object.create(standardMeta);
  newRequest.headers = {};
  newRequest.serverContext = null;
  return newRequest;
}

// (async () => {
//
//   console.log(Request().course.plus("hej"))
//   console.log(Request().sessions.plus("då"))
//
// })()

export default Request;
