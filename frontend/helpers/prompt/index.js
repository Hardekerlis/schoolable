import React, { Component, useState, useEffect } from 'react';

import styles from './prompt.module.sass'

import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


let promptRef;
let promptRefCallbacks = [];

const setPromptRef = elem => {

  promptRef = elem;

  for(let fn of promptRefCallbacks) {
    fn()
  }

}

const PromptRender = () => {

  promptRef = React.useRef();

  const closeClick = () => {

    //must be same as $containerHeight
    promptRef.children[0].classList.remove(`${styles.open}`)

  }

  return (
    <div ref={setPromptRef} className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.close}>
          <FontAwesomeIcon onClick={closeClick} icon={faTimes} />
        </div>
        <p>This is a temporary text. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>
      </div>

    </div>
  )

}

class Prompt_ {

  constructor() {

    this.elem = promptRef;

  }

  async show(msg) {
    await this.handleRef();

    this.box.classList.add(`${styles.open}`);

  }

  async handleRef() {

    if(!promptRef) {

      console.log("awaiting")

      await new Promise((resolve, reject) => {
        promptRefCallbacks.push(() => {
          resolve();
        })
      })

    }

    this.elem = promptRef;
    this.box = this.elem.children[0];

  }

}

const Prompt = (() => {
  return new Prompt_()
})();

export {
  Prompt,
  PromptRender
};
