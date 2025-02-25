import express from 'express';
import {
    createCourse,
    createLecture,
    deleteCourse,
    getAllCourses,
    getCourseLecture,
    getLectureById,
    publishCourse,
    removeLecture,
    updateLecture
} from '../controllers/course.controller.js';
import upload from '../middlewares/multer.middleware.js';

const router = express.Router();

// Course routes
router.route('/').post(upload.single('thumbnail'), createCourse);
router.route('/').get(getAllCourses);
router.route('/:courseId').delete(deleteCourse);
router.route('/:courseId/publish').patch(publishCourse);

// Lecture routes
router.route('/:courseId/lecture').post(upload.single('video'), createLecture);
router.route('/:courseId/lecture').get(getCourseLecture);
router.route('/:courseId/lecture/:lectureId').get(getLectureById);
router.route('/:courseId/lecture/:lectureId').patch(upload.single('video'), updateLecture);
router.route('/:courseId/lecture/:lectureId').delete(removeLecture);

export default router;
