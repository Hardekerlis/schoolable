const firstLetterToUpperCase = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const lowerFirstLetter = (string) => {
  if(!string) return "";
  return string.charAt(0).toLowerCase() + string.slice(1);
}


export {
  firstLetterToUpperCase,
  lowerFirstLetter
}
