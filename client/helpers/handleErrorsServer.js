import language from 'helpers/lang';
const lang = language.handleErrorsServer;

// const checkSpecificStatuses = (code) => {
//
//   if(code === 401) {
//
//     //will make the getServerSideProps caller to return
//     //propsContainer. Therefore redirect.
//     return {
//       isProps: true,
//       propsContainer: {
//         redirect: {
//           destination: '/pageNotFound',
//           permanent: false,
//         }
//       }
//     }
//
//
//   }
//
//   return false;
//
// }

const handleErrors = (successStatus, response, ignoreStatuses) => {
  const status = response._isJSON ? response._response.status : response.status;

  let error = false;

  if(status !== successStatus && ignoreStatuses.includes(status) === false) {
    //handle specific status code
    // errors = checkSpecificStatuses(status);

    // console.log('ERRORS:', error);

    if(error === false) {
      if(response.hasOwnProperty('errors')) {
        error = response.errors;
      }else {
        error = [lang.unexpected];
      }
    }

    error = {
      status,
      messages: error
    }

  }else {
    error = false;
  }

  // error.status = status;
  // error

  return error;
};

export default handleErrors;
