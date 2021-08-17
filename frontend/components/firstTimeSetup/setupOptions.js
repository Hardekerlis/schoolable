import Request from 'helpers/request.js'

// const password = {
//   name: "Choose a secure password",
//   method: async(evt, current) => {
//     console.log(evt.target.children[0].value)
//
//     let request = new Request('/api/auth', {}).post().json();
//     let res = await request.send();
//
//     console.log("res", res);
//
//
//
//   },
//   html: (current) => (
//     <form onSubmit={function (event) { event.preventDefault(); password.method(event, current); }}>
//       <input placeholder="Password" type="password" />
//       <input placeholder="Confirm password" type="password" />
//       <button type="submit">Submit</button>
//     </form>
//   ),
//   required: true,
//   completed: false
// }

// const password1 = {
//   name: "Choose a secure password",
//   method: () => {
//     console.log(current)
//   },
//   html: (
//     <form onSubmit={function (event) { event.preventDefault(); password.method(event); }}>
//       <input placeholder="Password" type="password" />
//       <button type="submit">Submit</button>
//     </form>
//   ),
//   required: true,
//   completed: false
// }

//FIX ME :)

const SetupForBuild = () => {
  return ("hej")
}

SetupForBuild.displayName = "SetupForBuild";

// const forBuild = [
//   password,
//   // password1
// ]


export default SetupForBuild;
