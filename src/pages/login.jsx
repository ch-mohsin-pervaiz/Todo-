import { useEffect, useState } from "react";
import "./auth.css";

function Login({ onLoginSuccess, onShowSignup, initialError }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(initialError || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialError) {
            sessionStorage.removeItem("authError");
        }
    }, [initialError]);

    async function handleSubmit(event) {
        event.preventDefault();

        setErrorMessage("");

        if (!email.trim() || !password) {
            setErrorMessage("Email and password are required.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not log in.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            onLoginSuccess?.(data.user);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleGoogleLogin() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.assign("/api/auth/google");
    }

    return (
        <main className="auth-page">
            <section className="auth-shell">
                <div className="auth-container">
                    <div className="auth-heading">
                        <h1>Login into your account</h1>
                    
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="field-group">
                            <label htmlFor="login-email">Email address</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                autoComplete="email"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="field-group">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {errorMessage && (
                            <p className="auth-message auth-message-error" role="alert">
                                {errorMessage}
                            </p>
                        )}

                        <button
                            className="auth-submit"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or continue with</span>
                    </div>

                    <button
                        className="auth-google"
                        type="button"
                        onClick={handleGoogleLogin}
                    >
                        <span className="google-mark" aria-hidden="true">G</span>
                        Continue with Google
                    </button>

                    <p className="auth-switch">
                        Don't have an account?{" "}
                        <button className="auth-link" type="button" onClick={onShowSignup}>
                            Sign up
                        </button>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Login;