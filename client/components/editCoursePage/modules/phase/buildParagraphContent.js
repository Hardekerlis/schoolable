const BuildContent = (content, type) => {

  let data;

  console.log("building content...");

  if(type === 'text') {
    data = content;
  }else {
    console.log("unsupported paragraph type")
  }


  return data;

}

export default BuildContent;
