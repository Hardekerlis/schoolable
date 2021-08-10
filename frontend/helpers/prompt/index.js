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

const waitFor = async(ms) => {

  await new Promise((resolve, reject) => {

    setTimeout(() => {

      resolve();

    }, ms * 1000)

  })

}

const closeClick = () => {

  promptRef.children[0].classList.remove(`${styles.open}`);

}

class Prompt_ {

  constructor() {

    this.elem = promptRef;

    this.opened = false;

    this.animating = false;

    this.timeCounter = 0;

  }

  handleBoxClosing() {

    this.timeCounter++;

    setTimeout(() => {

      this.timeCounter--;

      if(this.timeCounter === 0) {
        closeClick();
      }

    }, 8000)

  }

  async openBox(msg, type) {

    if(this.animating) {
      return;
    }

    this.animating = true;

    if(this.opened) {

      closeClick();

      await waitFor(0.2);

    }

    this.box.classList.remove(`${styles.error}`);
    this.box.classList.remove(`${styles.success}`);
    this.box.classList.remove(`${styles.show}`);


    this.box.classList.add(`${styles[type]}`);

    this.box.children[1].textContent = msg;

    this.opened = true;

    this.animating = false;

    this.box.classList.add(`${styles.open}`);

    this.handleBoxClosing();

  }

  async show(msg) {
    await this.handleRef();

    this.openBox(msg, 'show');

  }

  async error(msg) {
    await this.handleRef();

    this.openBox(msg, 'error');

  }

  async success(msg) {
    await this.handleRef();

    this.openBox(msg, 'success');

  }



  async handleRef() {

    if(!promptRef) {

      console.log("awaiting prompt ref")

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
