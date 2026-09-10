import { useState } from "react";
import "./auth.css";

function Signup({ onSignupSuccess, onShowLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (!email.trim() || !password || !confirmPassword) {
            setErrorMessage("All fields are required.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/signup", {
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
                throw new Error(
                    data.message || "Could not create account."
                );
            }

            setSuccessMessage(
                "Account created successfully. You can now log in."
            );

            setEmail("");
            setPassword("");
            setConfirmPassword("");

            onSignupSuccess?.(data.user);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleGoogleSignup() {
        window.location.assign("/api/auth/google");
    }

    return (
        <main className="auth-page">
            <section className="auth-shell">
                <div className="auth-container">
                    <div className="auth-heading">
                        <h1>Sign into your account</h1>
                        
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="field-group">
                            <label htmlFor="signup-email">Email address</label>
                            <input
                                id="signup-email"
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
                            <label htmlFor="signup-password">Password</label>
                            <input
                                id="signup-password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="new-password"
                                placeholder="At least 6 characters"
                                required
                            />
                        </div>

                        <div className="field-group">
                            <label htmlFor="signup-confirm-password">Confirm password</label>
                            <input
                                id="signup-confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                autoComplete="new-password"
                                placeholder="Repeat your password"
                                required
                            />
                        </div>

                        {errorMessage && (
                            <p className="auth-message auth-message-error" role="alert">
                                {errorMessage}
                            </p>
                        )}

                        {successMessage && (
                            <p className="auth-message auth-message-success" role="status">
                                {successMessage}
                            </p>
                        )}

                        <button
                            className="auth-submit"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating account..." : "Sign up"}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or continue with</span>
                    </div>

                    <button
                        className="auth-google"
                        type="button"
                        onClick={handleGoogleSignup}
                    >
                        <span className="google-mark" aria-hidden="true">G</span>
                        Continue with Google
                    </button>

                    <p className="auth-switch">
                        Already have an account?{" "}
                        <button className="auth-link" type="button" onClick={onShowLogin}>
                            Log in
                        </button>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Signup;