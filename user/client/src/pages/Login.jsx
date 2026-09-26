import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const { login, googleLogin } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login(form.email, form.password);

      navigate(location.state?.from || "/");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">WELCOME BACK</span>

        <h1>Login</h1>

        {error && <div className="error">{error}</div>}

        <label>Email</label>

        <input
          type="email"
          required
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <label>Password</label>

        <input
          type="password"
          required
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button
          style={{ marginTop: "20px", marginBottom: "10px" }}
          className="btn full"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div>
          <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            <div style={{ textAlign: "center", fontSize: "16px" }}>
              Continue with Google
            </div>
            <div
              style={{
                width: "370px",
                height: "1px",
                background: "gray",
                marginTop: "15px",
              }}
            />
          </div>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                setLoading(true);
                setError("");

                await googleLogin(credentialResponse.credential);

                navigate(location.state?.from || "/");
              } catch (error) {
                setError(
                  error.response?.data?.message || "Google login failed",
                );
              } finally {
                setLoading(false);
              }
            }}
            onError={() => {
              setError("Google login failed");
            }}
          />
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
