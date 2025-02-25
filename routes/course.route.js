import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, editCourse, editLecture, getCourseById, getCourseLecture, getCreatorCourses, getLectureById, getPublishedCourse, removeCourse, removeLecture, searchCourse, togglePublishCourse } from "../controllers/course.controller.js";
import { uploadSingle, uploadLecture } from "../middlewares/multer.middleware.js";
const router = express.Router();

router.route("/").post(isAuthenticated, uploadSingle, createCourse);
router.route("/search").get(searchCourse);
router.route("/published-courses").get(getPublishedCourse);
router.route("/").get(isAuthenticated, getCreatorCourses);
router.route("/:courseId").put(isAuthenticated, uploadSingle, editCourse);
router.route("/:courseId").delete(isAuthenticated, removeCourse);
router.route("/:courseId").get(getCourseById);
router.route("/:courseId/lecture").post(isAuthenticated, uploadLecture, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, uploadLecture, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);

export default router;