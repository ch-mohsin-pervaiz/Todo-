import jwt from "jsonwebtoken";

export function authenticate(request, response) {
    const authorization = request.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token || !process.env.JWT_SECRET) {
        response.status(401).json({ message: "Authentication required." });
        return null;
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        response.status(401).json({ message: "Authentication required." });
        return null;
    }
}
