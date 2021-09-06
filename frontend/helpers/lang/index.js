import Cookies from 'js-cookie';

import eng from './eng.json';
import swe from './swe.json';

let cookieValue = Cookies.get('selectedLang');

const setDefaultCookie = () => {
  Cookies.set('selectedLang', 'eng');
  cookieValue = 'eng';
}

if(!cookieValue) setDefaultCookie();

const langs = {
  eng,
  swe
}

if(!langs.hasOwnProperty(cookieValue)) setDefaultCookie();

let currentLang = cookieValue;

export default langs[currentLang];
