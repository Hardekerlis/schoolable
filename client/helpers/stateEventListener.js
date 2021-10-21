import React, { useState, useEffect } from 'react';

import { nanoid } from 'nanoid';

const listeners = {};

const createStateListener = (stateValue, element, eventType, method) => {
  let [state, _setState] = useState(stateValue);
  let [listenerCreated, setListenerCreated] = useState(false);

  let stateRef = React.useRef(state);

  let id = nanoid(8);

  const setState = value => {
    stateRef.current = value;
    _setState(value);
  };

  useEffect(() => {
    if(element === '*') {
      if(typeof window !== 'undefined') {
        const listMethod = event => method(event, stateRef);

        window.addEventListener(eventType, listMethod, false);

        listeners[id] = {
          method: listMethod,
          type: eventType,
          element,
        };
      }
    }
  }, []);

  return [state, setState, id];
};

const removeStateListener = id => {
  console.log(id);
  console.log(listeners[id]);
  console.log(listeners);
  const listener = listeners[id];

  if(listeners.element === '*') {
    window.removeEventListener(listener.type, listener.method);
  }
};

export { createStateListener, removeStateListener };
