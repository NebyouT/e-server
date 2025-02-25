import { User } from "../models/user.model.js";

const isInstructor = async (req, res, next) => {
    try {
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Allow both instructors and admins
        if (user.role !== "instructor" && user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only instructors and admins can perform this action."
            });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify instructor status"
        });
    }
};

export default isInstructor;
