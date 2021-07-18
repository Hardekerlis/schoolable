const password = {
  name: "Choose a secure password",
  method: () => {},
  html: (
    <form onSubmit={function (event) { event.preventDefault(); password.method(event); }}>
      <input placeholder="Password" type="password" />
      <input placeholder="Confirm password" type="password" />
      <button type="submit">Submit</button>
    </form>
  ),
  required: true
}



export default [

  password

]
