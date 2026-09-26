import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          MyStore
        </Link>

        <nav>
          <Link to="/">Products</Link>

          {isAuthenticated && (
            <>
              <Link to="/cart">Cart</Link>
              <Link to="/orders">Orders</Link>
            </>
          )}
        </nav>

        <div className="nav-right">
          {isAuthenticated ? (
            <>
              <span>Hi, {user?.name}</span>

              <button className="btn secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn secondary" to="/login">
                Login
              </Link>

              <Link className="btn" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
