import { useNavigate, Link } from "react-router";

const Register = () => {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="userName">Username</label>
            <input
              type="text"
              id="userName"
              name="userName"
              placeholder="Enter Username"
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email address"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
            />
          </div>

          <button className="button primary-button">Register</button>
        </form>

        <p>I already have an account <Link to="/login">Login</Link></p>
      </div>
    </main>
  );
};

export default Register;
