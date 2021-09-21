import Cookies from 'js-cookie';

import ENG from './ENG.json';
import SWE from './SWE.json';

let cookieValue = Cookies.get('selectedLang');

const setDefaultCookie = () => {
  Cookies.set('selectedLang', 'ENG');
  cookieValue = 'ENG';
}

if(!cookieValue) setDefaultCookie();

const langs = {
  ENG,
  SWE
}

if(!langs.hasOwnProperty(cookieValue)) setDefaultCookie();

let currentLang = cookieValue;

export default langs[currentLang];
