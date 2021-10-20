import dynamic from 'next/dynamic';

import { nanoid } from 'nanoid';

class Subscription {
  constructor(name, id, method, unsubscribe) {
    this.method = method;
    this.name = name;
    this.id = id;
    this._unsubscribe = unsubscribe;
    this.value = true;
  }

  unsubscribe() {
    this._unsubscribe(this.name, this.id);
    delete this;
  }

  active(value) {
    this.value = value;
    return this;
  }
}

const GlobalEventHandlerInternal = () => {
  if(typeof window === 'undefined') return;

  let subscribers = {};

  const create = (name, element, eventType) => {
    let elem = element;

    if(elem === '*') elem = window;

    const method = (event, subscribers) => {
      for (let fn in subscribers[name]) {
        let sub = subscribers[name][fn];
        if(sub.value) {
          sub.method(event);
        }
      }
    };

    elem.addEventListener(eventType, event => method(event, subscribers));

    subscribers[name] = {};
  };

  const unsubscribe = (name, id) => {
    delete subscribers[name][id];
  };

  const subscribe = (name, method) => {
    let id = nanoid(8);

    let subscription = new Subscription(name, id, method, unsubscribe);

    subscribers[name][id] = subscription;

    return subscription;
  };

  return {
    create,
    subscribe,
  };
};

const GlobalEventHandler = GlobalEventHandlerInternal();

if(typeof window !== 'undefined') {
  GlobalEventHandler.create('windowClick', '*', 'click');
}

export default GlobalEventHandler;
