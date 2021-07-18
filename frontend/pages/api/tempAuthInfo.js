const tempUser = {
  username: 'e',
  password: 'e',
  type: 'teacher'
}

let token = ''

const setToken = (tok) => {
  token = tok;
}

const getToken = () => {
  return token;
}

const keys = ['secret phrase']

export {
  tempUser,
  keys,
  setToken,
  getToken
}
