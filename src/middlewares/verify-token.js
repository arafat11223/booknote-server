
import { jwtVerify, createRemoteJWKSet } from "jose";
import { ObjectId } from "mongodb";

import { db } from "../config/db.js";

const AUTH_URL = process.env.BETTER_AUTH_URL;

const JWKS_URL =
  process.env.BETTER_AUTH_JWKS_URL ||
  `${AUTH_URL}/api/auth/jwks`;

const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: AUTH_URL,
      audience: AUTH_URL,
    });

    if (!payload.sub || !ObjectId.isValid(payload.sub)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token user ID.",
      });
    }

    const user = await db.collection("user").findOne({
      _id: new ObjectId(payload.sub),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    req.userId = user._id;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Unauthorized! Invalid or expired token.",
    });
  }
};

export default verifyToken;
