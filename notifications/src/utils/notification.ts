/*
  What should a notification be?
  The notification class when iniziliazed should represent a "finished" notification



*/

interface Category {
  main: string;
  sub: string;
}

interface InitializationData {
  category: Category;
  title: object;
  body: object;
}

export default class Notification {
  private _category: Category;
  private _title: object;
  private _body: object;
  private lang = '';

  constructor(data: InitializationData) {
    this._category = data.category;
    this._title = data.title;
    this._body = data.body;
  }

  get category() {
    return this._category;
  }

  get title() {
    // @ts-ignore
    return this._title[`${this.lang}`];
  }

  get body() {
    // @ts-ignore
    return this._body[`${this.lang}`];
  }

  setLanguage(lang: string) {
    this.lang = lang.toUpperCase();

    return this;
  }
}
