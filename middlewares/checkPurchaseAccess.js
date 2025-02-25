import { CoursePurchase } from "../models/coursePurchase.model.js";

const checkPurchaseAccess = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.id;

    // Check if user has purchased this course
    const purchase = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed"
    });

    if (!purchase) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You have not purchased this course."
      });
    }

    // Add purchase to request object for potential future use
    req.purchase = purchase;
    next();
  } catch (error) {
    console.error('Purchase access check error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error checking course access"
    });
  }
};

export default checkPurchaseAccess;

