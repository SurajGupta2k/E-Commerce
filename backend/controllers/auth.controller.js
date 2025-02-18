/**
 * Authentication Controller
 * Handles all authentication-related operations including user signup, login, logout, and token management.
 * Author: Suraj
 * Created: February 2024
 */

import User from "../models/user.model.js";
import { redis } from "../lib/redis.js";
import jwt from "jsonwebtoken";

/**
 * Generates access and refresh tokens for a user
 * Access token expires in 15 minutes for security
 * Refresh token expires in 7 days for better UX
 */
const generateTokenAndSetCookie = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};

/**
 * Stores refresh token in Redis for token rotation security
 * Using Redis for better performance and automatic expiration
 */
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 60 * 60 * 24 * 7);
};

/**
 * Sets secure HTTP-only cookies for both tokens
 * Using secure cookies in production and lax same-site policy for development
 */
const setCookie = (res, refreshToken, accessToken) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/"
    });
    
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/"
    });
};

export const signup = async (req, res) => {
    const { name, email, password } = req.body
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await User.create({ name, email, password });
        const {accessToken, refreshToken} = generateTokenAndSetCookie(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookie(res, refreshToken, accessToken);
        res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
        });
    } catch (error) {
        console.log("error in signup", error.message);
        res.status(500).json({ message: error.message });   
    }
};

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        
        if(user && (await user.comparePassword(password))){
            const {accessToken, refreshToken} = generateTokenAndSetCookie(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookie(res, refreshToken, accessToken);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.log("error in login", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
   try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    await redis.del(`refresh_token:${decoded.userId}`);
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.status(200).json({ message: "Logged out successfully" });
   } catch (error) {
    console.log("error in logout", error.message);
    res.status(500).json({ message:"Server Error", error: error.message });
   }
};

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV !== "development",sameSite: "strict", maxAge: 15 * 60 * 1000 });
        res.status(200).json({ message: "Token refreshed successfully" });
    } catch (error) {
        console.log("error in refreshToken", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log("error in getProfile", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}