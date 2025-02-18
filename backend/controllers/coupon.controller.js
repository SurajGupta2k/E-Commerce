import Coupon from "../models/coupon.model.js";
export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ userId: req.user._id, isActive: true });
        res.status(200).json(coupons || null);
    } catch (error) {
        console.log("Error in getCoupons controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code:code,userId:req.user._id,isActive:true });
        if(!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        if(coupon.expirationDate < new Date()) {
            coupon.isActive = false;
            await coupon.save();
            return res.status(400).json({ message: "Coupon expired" });
        }
        res.json({ 
            message: "Coupon validated",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
        })
    } catch (error) {
        console.log("Error in validateCoupon controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createCoupon = async (req, res) => {
    try {
        // Delete any existing coupons for this user
        await Coupon.findOneAndDelete({ userId: req.user._id });

        const newCoupon = new Coupon({
            code: "TEST100",
            discountPercentage: 100,
            expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            userId: req.user._id,
        });

        await newCoupon.save();
        res.status(201).json(newCoupon);
    } catch (error) {
        console.log("Error in createCoupon controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};