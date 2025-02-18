import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if(!accessToken){
            return res.status(401).json({ message: "Unauthorized" });
        }
        try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.userId);
        if(!user){
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        next();
        } catch (error) {
            if(error.name === "JsonWebTokenError"){
                return res.status(401).json({ message: "Unauthorized - token is expired" });
            }
           throw error;
        }
    } catch (error) {
        console.log("error in protectRoute", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const adminRoute = async (req, res, next) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
};