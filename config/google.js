import { OAuth2Client } from "google-auth-library";

function requestOrigin(request) {
    const forwardedProtocol = request.headers["x-forwarded-proto"];
    const protocol = forwardedProtocol || request.protocol;
    return `${protocol}://${request.get("host")}`;
}

export function getGoogleRedirectUri(request) {
    if (process.env.VERCEL === "1") {
        return `${requestOrigin(request)}/api/auth/google/callback`;
    }

    return process.env.GOOGLE_REDIRECT_URI ||
        `${requestOrigin(request)}/api/auth/google/callback`;
}

export function getFrontendUrl(request) {
    if (process.env.VERCEL === "1") {
        return requestOrigin(request);
    }

    return process.env.FRONTEND_URL || requestOrigin(request);
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
