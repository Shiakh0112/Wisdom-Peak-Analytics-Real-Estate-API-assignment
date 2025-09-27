const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../config/firebase");

// --------------------- REGISTER ---------------------
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to MongoDB
    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create user in Firebase
    await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // JWT payload
    const payload = { user: { id: user.id } };

    // Sign JWT and return token + user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.date,
          },
        });
      }
    );
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).send("Server error");
  }
};

// --------------------- LOGIN ---------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // JWT payload
    const payload = { user: { id: user.id } };

    // Sign JWT and return token + user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.date,
          },
        });
      }
    );
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send("Server error");
  }
};

// --------------------- LOGOUT ---------------------
exports.logout = (req, res) => {
  res.json({ msg: "User logged out successfully" });
};
