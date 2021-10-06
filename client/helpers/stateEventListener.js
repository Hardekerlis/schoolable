import React, { useState, useEffect } from 'react';

const createStateListener = (stateValue, element, eventType, method) => {

  let [ state, _setState ] = useState(stateValue);
  let [ listenerCreated, setListenerCreated ] = useState(false);

  let stateRef = React.useRef(state);

  const setState = (value) => {
    stateRef.current = value;
    _setState(value);
  }

  useEffect(() => {
    if(element === '*') {
      if(typeof window !== 'undefined') {

        window.addEventListener(eventType, (event) => method(event, stateRef), false);

      }
    }
  }, [])

  return [
    state,
    setState
  ]

}

export {
  createStateListener
}
