import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";

export const getCourseDetailWithStatus = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.id;

        // Get course with populated creator and lectures
        const course = await Course.findById(courseId)
            .populate('creator', 'name photoUrl')
            .populate('lectures')
            .populate('enrolledStudents');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Check if user has purchased the course
        const user = await User.findById(userId);
        const purchased = user.enrolledCourses.includes(courseId);

        return res.status(200).json({
            success: true,
            course,
            purchased
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to get course details"
        });
    }
};

export const getPurchasedCourses = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).populate('enrolledCourses');

        return res.status(200).json({
            success: true,
            courses: user.enrolledCourses || []
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to get purchased courses"
        });
    }
};

export const createCheckoutSession = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.id;

        // For now, just enroll the user directly
        const user = await User.findById(userId);
        if (!user.enrolledCourses.includes(courseId)) {
            user.enrolledCourses.push(courseId);
            await user.save();
        }

        // Add user to course's enrolled students
        const course = await Course.findById(courseId);
        if (!course.enrolledStudents.includes(userId)) {
            course.enrolledStudents.push(userId);
            await course.save();
        }

        return res.status(200).json({
            success: true,
            message: "Course purchased successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create checkout session"
        });
    }
};
