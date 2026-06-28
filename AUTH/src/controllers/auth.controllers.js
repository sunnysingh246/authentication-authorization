import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOTP, getOtpHtml } from "../utils/utils.js";
import userModel from "../models/users.model.js";
import bcrypt from "bcrypt";
import otpModel from "../models/otp.models.js";

// Register
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword
    });

    // OTP
    const otp = generateOTP();

    const otpHashed = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    await otpModel.create({
      user: user._id,
      email,
      otpHashed
    });

    await sendEmail(
      email,
      "OTP Verification",
      `Your OTP is ${otp}`,
      getOtpHtml(otp)
    );

    // Refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    // Access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        sessionId: session._id
      },
      config.JWT_SECRET,
      {
        expiresIn: "15m"
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      message: "Registered successfully",
      user: {
        username: user.username,
        email: user.email,
        verified: user.verified
      },
      accessToken
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}


// Login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!user.verified) {
      return res.status(401).json({
        message: "Email not verified"
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }


    const refreshToken = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");


    const session = await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });


    const accessToken = jwt.sign(
      {
        id: user._id,
        sessionId: session._id
      },
      config.JWT_SECRET,
      {
        expiresIn: "15m"
      }
    );


    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });


    return res.status(200).json({
      message: "Logged in successfully",
      user: {
        username: user.username,
        email: user.email
      },
      accessToken
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}


// Get current user
export async function getMe(req, res) {
  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found"
      });
    }


    const decoded = jwt.verify(
      token,
      config.JWT_SECRET
    );


    const user = await userModel.findById(decoded.id)
      .select("-password");


    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    return res.status(200).json({
      user
    });


  } catch (error) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
}


// Refresh access token
export async function refreshToken(req, res) {
  try {

    const oldToken = req.cookies.refreshToken;


    if (!oldToken) {
      return res.status(401).json({
        message: "Refresh token missing"
      });
    }


    const oldHash = crypto
      .createHash("sha256")
      .update(oldToken)
      .digest("hex");


    const session = await sessionModel.findOne({
      refreshTokenHash: oldHash,
      revoked: false
    });


    if (!session) {
      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }


    const decoded = jwt.verify(
      oldToken,
      config.JWT_SECRET
    );


    const newRefreshToken = jwt.sign(
      { id: decoded.id },
      config.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );


    session.refreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    await session.save();


    const accessToken = jwt.sign(
      {
        id: decoded.id,
        sessionId: session._id
      },
      config.JWT_SECRET,
      {
        expiresIn: "15m"
      }
    );


    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });


    return res.status(200).json({
      message: "Token refreshed",
      accessToken
    });


  } catch (error) {
    return res.status(401).json({
      message: "Invalid refresh token"
    });
  }
}


// Logout current device
export async function logout(req, res) {
  try {

    const refreshToken = req.cookies.refreshToken;


    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token not found"
      });
    }


    const hash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");


    await sessionModel.findOneAndUpdate(
      {
        refreshTokenHash: hash,
        revoked: false
      },
      {
        revoked: true
      }
    );


    res.clearCookie("refreshToken");


    return res.status(200).json({
      message: "Logged out successfully"
    });


  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}


// Logout all devices
export async function logoutAll(req, res) {
  try {

    const refreshToken = req.cookies.refreshToken;


    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token not found"
      });
    }


    const decoded = jwt.verify(
      refreshToken,
      config.JWT_SECRET
    );


    await sessionModel.updateMany(
      {
        user: decoded.id,
        revoked: false
      },
      {
        revoked: true
      }
    );


    res.clearCookie("refreshToken");


    return res.status(200).json({
      message: "Logged out from all devices"
    });


  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}


// Verify email
export async function verifyEmail(req, res) {
  try {

    const { otp, email } = req.body;


    const otpHashed = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");


    const otpDoc = await otpModel.findOne({
      email,
      otpHashed
    });


    if (!otpDoc) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }


    const user = await userModel.findByIdAndUpdate(
      otpDoc.user,
      {
        verified: true
      },
      {
        new: true
      }
    );


    await otpModel.deleteMany({
      user: otpDoc.user
    });


    return res.status(200).json({
      message: "Email verified successfully",
      user: {
        username: user.username,
        email: user.email,
        verified: user.verified
      }
    });


  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}