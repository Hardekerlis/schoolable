import { getUserData } from 'helpers';

const userTypesPriorities = [
  'admin',
  'teacher',
  'tempTeacher',
  'external',
  'student',
  'guardian',
];

userTypesPriorities.reverse();

const Permission = () => {
  const user = getUserData();

  const getIndexs = type => {
    let typePerm = userTypesPriorities.indexOf(type);
    let userPerm = userTypesPriorities.indexOf(user.userType);

    if(typePerm === -1 || userPerm === -1) return [false, false];
    return [typePerm, userPerm];
  };

  const atLeast = type => {
    let [typePerm, userPerm] = getIndexs(type);
    if(userPerm === false) return false;

    if(userPerm >= typePerm) return true;
    return false;
  };

  const max = type => {
    let [typePerm, userPerm] = getIndexs(type);
    if(userPerm === false) return false;

    if(userPerm <= typePerm) return true;
    return false;
  };

  return {
    atLeast,
    max,
  };
};

export default Permission;
