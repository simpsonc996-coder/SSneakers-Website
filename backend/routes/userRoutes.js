import express from "express"; // Import express to create a router
import User from "../models/User.js"; // Import User model created in models folder
import jwt from "jsonwebtoken"; // Used to create JWT and perform secure user authentication
import { protect } from "../middleware/authMiddleware.js"; // Imports the custom middleware that was created earlier. Used to protect private routes. It checks whether token exists, is token valid and attach user to req.user

const router = express.Router(); // Create express router

// Every route is mounted in server.js as app.use("/api/users", userRoutes); So, every route is relative to /api/users
// userRoutes.js does 3 jobs:
// 1. Register a user → create account + issue JWT
// 2. Login a user → verify credentials + issue JWT
// 3. Profile → return user info only if JWT is valid

// User registration route
// @route @POST /api/users/register
// @desc Register a new user
// @access Public
// We will not specify /api/users here because it is specified in server.js where we use this router
router.post("/register", async (req, res) => { // Creates a new user and immediately logs them in (by issuing JWT)
  const { name, email, password } = req.body; // Data sent from frontend

  try {
    // Registration logic here
    let user = await User.findOne({ email }); // Check if user already exists with the given email
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }
    user = new User({ name, email, password }); // Create a new user instance
    await user.save(); // Save the new user to the database

    // Create JWT payload
    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    // Sign and return JWT token along with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) throw err;
        // Send user data and token as response
        res.status(201).json({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        });
      }
    );
  } catch (error) {
    console.log("Error registering user:", error);
    res.status(500).send("Server error");
  }
});

// @route POST /api/users/login
// @desc Authenticate user and get token
// @access Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    // Sign and return JWT token along with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) throw err;
        // Send user data and token as response
        res.json({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        });
      }
    );
  } catch (error) {
    console.log("Error logging in user:", error);
    res.status(500).send("Server error");
  }
});

// @route GET /api/users/profile
// @desc Get logged in user's profile (protected route)
// @access Private
router.get("/profile", protect, async (req, res) => {
    res.json(req.user);
});

export default router;