// Middleware to protect routes and get user from token
import jwt from "jsonwebtoken"; // Import JWT library to verify tokens (not create them)
import User from "../models/User.js"; // Used to fetch user data from DB after decoding token


// Middleware has 3 parameters - request, response, next
// If next() if not called then the request stops here
const protect = async (req, res, next) => {
  let token; // Declares variable to store JWT token

  // Check for token in headers
  // If authorization header exists and it starts with 'Bearer'
  // Bearer is a standard/convention defined by HTTP authentication specs. It is not user-defined name
  // Format of authentication header is Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from authorization header which starts with 'Bearer'
      token = req.headers.authorization.split(" ")[1]; // Splits string - "Bearer TOKEN". Index 1 gives TOKEN

      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token using secret key. If token is expired, tampered, invalid, then error is thrown. If valid, returns decoded payload
      req.user = await User.findById(decoded.user.id).select("-password"); // Fetches full user from DB using ID in token excluding password (because there is never a valid reason for a route to expose a user’s password - not even a hashed one)
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      next(); // Proceed to the next middleware
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role == "admin") {
    next(); // User is admin, proceed to next middleware
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

export { protect, admin };