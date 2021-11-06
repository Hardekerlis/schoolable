const requireQueries = (ctx, queries) => {

  let missingAnyQuery = false;

  for(let query of queries) {
    if(!Object.prototype.hasOwnProperty.call(ctx.query, query)) {
      console.log("missing a query")
      missingAnyQuery = true;
      break;
    }
  }

  return !missingAnyQuery;
}

export default requireQueries;
