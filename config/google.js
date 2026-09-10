import { OAuth2Client } from "google-auth-library";

export function getGoogleRedirectUri(request) {
    return process.env.GOOGLE_REDIRECT_URI ||
        `${request.protocol}://${request.get("host")}/api/auth/google/callback`;
}

export function createGoogleClient(request) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error("Google OAuth credentials are not configured");
    }

    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        getGoogleRedirectUri(request)
    );
}
