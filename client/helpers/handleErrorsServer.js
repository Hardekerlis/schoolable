import language from 'helpers/lang';
const lang = language.handleErrorsServer;

// const checkSpecificStatuses = (code) => {
//
//   if(code === 404) {
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

  let errors = false;

  if(status !== successStatus && ignoreStatuses.includes(status) === false) {
    //handle specific status code

    console.log('ERRORS:', errors);

    if(errors === false) {
      if(response.hasOwnProperty('errors')) {
        errors = response.errors;
      }else {
        errors = [lang.unexpected];
      }
    }
  }else {
    errors = false;
  }

  return errors;
};

export default handleErrors;
