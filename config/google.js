import { OAuth2Client } from "google-auth-library";
function requestOrigin(request) {
    const forwardedProtocol =
        request.headers["x-forwarded-proto"] || "https";

    const host =
        request.headers.host || request.get("host");

    return `${forwardedProtocol}://${host}`;
}

export function getGoogleRedirectUri(request) {
    if (process.env.GOOGLE_REDIRECT_URI) {
        return process.env.GOOGLE_REDIRECT_URI;
    }
    return `${requestOrigin(request)}/api/auth/google/callback`;
}

export function getFrontendUrl(request) {

    if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL;
    }
    return requestOrigin(request);
}

export function createGoogleClient(request) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error(
            "Google OAuth credentials are not configured"
        );
    }

    return new OAuth2Client(
        clientId,
        clientSecret,
        getGoogleRedirectUri(request)
    );
}

