import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/useAuth";

export default function Register() {
  const { register, googleLogin } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await register(form.name, form.email, form.password);

      setSuccess(response.message || "Account created successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">CREATE ACCOUNT</span>

        <h1>Register</h1>

        {error && <div className="error">{error}</div>}

        {success && <div className="success">{success}</div>}

        <label>Name</label>

        <input
          value={form.name}
          required
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <label>Email</label>

        <input
          type="email"
          value={form.email}
          required
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
          value={form.password}
          required
          minLength={6}
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
          {loading ? "Creating account..." : "Register"}
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
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
