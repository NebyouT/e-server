 import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import {deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia} from "../utils/cloudinary.js";

export const createCourse = async (req,res) => {
    try {
        const {courseTitle, category, subTitle, description, courseLevel, coursePrice} = req.body;
        const thumbnail = req.file;

        if(!courseTitle || !category) {
            return res.status(400).json({
                success: false,
                message: "Course title and category are required."
            });
        }

        let courseThumbnail;
        if(thumbnail) {
            // Upload thumbnail to Cloudinary
            const uploadResponse = await uploadMedia(thumbnail.path);
            if(!uploadResponse) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload thumbnail"
                });
            }
            courseThumbnail = uploadResponse.secure_url;
        }

        const course = await Course.create({
            courseTitle,
            category,
            subTitle,
            description,
            courseLevel,
            coursePrice,
            courseThumbnail,
            creator: req.id
        });

        return res.status(201).json({
            success: true,
            course,
            message: "Course created successfully"
        });
    } catch (error) {
        console.error('Create course error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to create course"
        });
    }
};

export const searchCourse = async (req,res) => {
    try {
        const {query = "", categories, sortByPrice = ""} = req.query;
        console.log('Categories received:', categories);
        
        // create search query
        const searchCriteria = {
            isPublished: true,
            $or: [
                {courseTitle: {$regex: query, $options: "i"}},
                {subTitle: {$regex: query, $options: "i"}},
                {category: {$regex: query, $options: "i"}},
            ]
        };

        // if categories selected
        if(categories) {
            // Handle both single category and array of categories
            const categoryArray = Array.isArray(categories) ? categories : [categories];
            searchCriteria.category = {$in: categoryArray};
            console.log('Category criteria:', searchCriteria.category);
        }

        // define sorting order
        const sortOptions = {};
        if(sortByPrice === "low"){
            sortOptions.coursePrice = 1;//sort by price in ascending
        }else if(sortByPrice === "high"){
            sortOptions.coursePrice = -1; // descending
        }

        console.log('Final search criteria:', searchCriteria);
        
        let courses = await Course.find(searchCriteria)
            .populate({path:"creator", select:"name photoUrl"})
            .sort(sortOptions);

        console.log('Found courses:', courses.length);

        return res.status(200).json({
            success: true,
            courses: courses || []
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to search courses",
            courses: []
        });
    }
}

export const getPublishedCourse = async (_,res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate({path:"creator", select:"name photoUrl"});
        if(!courses){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get published courses"
        })
    }
}
export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({creator:userId});
        if(!courses){
            return res.status(404).json({
                courses:[],
                message:"Course not found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}
export const editCourse = async (req,res) => {
    try {
        const courseId = req.params.courseId;
        const {courseTitle, subTitle, description, category, courseLevel, coursePrice} = req.body;
        const thumbnail = req.file;

        let course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }
        let courseThumbnail;
        if(thumbnail){
            if(course.courseThumbnail){
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId); // delete old image
            }
            // upload a thumbnail on clourdinary
            courseThumbnail = await uploadMedia(thumbnail.path);
        }

 
        const updateData = {courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail:courseThumbnail?.secure_url};

        course = await Course.findByIdAndUpdate(courseId, updateData, {new:true});

        return res.status(200).json({
            course,
            message:"Course updated successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}
export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params;

        const course = await Course.findById(courseId)
            .populate('creator', 'name photoUrl')
            .populate('lectures')
            .populate('enrolledStudents');

        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }
        return res.status(200).json({
            course
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get course by id"
        })
    }
}

export const createLecture = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { lectureTitle, description, contentType, textContent, isPreviewFree } = req.body;
        const files = req.files || {};

        // Validate required fields
        if (!lectureTitle || !description || !contentType) {
            return res.status(400).json({
                success: false,
                message: "Please provide lecture title, description, and content type"
            });
        }

        // Validate content type and file requirements
        if ((contentType === 'video' && !files.video) || 
            (contentType === 'pdf' && !files.pdf) || 
            (contentType === 'text' && !textContent)) {
            return res.status(400).json({
                success: false,
                message: `Missing required content for ${contentType} type lecture`
            });
        }

        // Check if course exists first
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Create lecture with basic info
        const lecture = new Lecture({
            lectureTitle,
            description,
            contentType,
            isPreviewFree: isPreviewFree === 'true',
            course: courseId
        });

        // Handle content based on type
        try {
            if (contentType === 'video' && files.video) {
                const videoFile = files.video[0];
                console.log('Uploading video:', videoFile.path);
                
                const videoUpload = await uploadMedia(videoFile.path, 'video');
                if (!videoUpload?.secure_url) {
                    throw new Error('Failed to upload video: No secure URL returned');
                }
                
                lecture.videoUrl = videoUpload.secure_url;
                lecture.videoPublicId = videoUpload.public_id;
                
                console.log('Video upload successful:', {
                    url: lecture.videoUrl,
                    publicId: lecture.videoPublicId
                });
            } 
            else if (contentType === 'pdf' && files.pdf) {
                const pdfFile = files.pdf[0];
                console.log('Uploading PDF:', pdfFile.path);
                
                const pdfUpload = await uploadMedia(pdfFile.path, 'pdf');
                if (!pdfUpload?.secure_url) {
                    throw new Error('Failed to upload PDF: No secure URL returned');
                }
                
                lecture.pdfUrl = pdfUpload.secure_url;
                lecture.pdfPublicId = pdfUpload.public_id;
                
                console.log('PDF upload successful:', {
                    url: lecture.pdfUrl,
                    publicId: lecture.pdfPublicId
                });
            } 
            else if (contentType === 'text') {
                lecture.textContent = textContent;
                console.log('Text content saved successfully');
            }
        } catch (uploadError) {
            console.error('Content upload error:', {
                error: uploadError,
                message: uploadError.message,
                stack: uploadError.stack
            });
            
            return res.status(500).json({
                success: false,
                message: `Failed to upload ${contentType}: ${uploadError.message}`
            });
        }

        // Save lecture
        await lecture.save();
        console.log('Lecture saved successfully:', lecture._id);

        // Add lecture to course
        course.lectures.push(lecture._id);
        await course.save();
        console.log('Course updated with new lecture');

        return res.status(201).json({
            success: true,
            lecture,
            message: "Lecture created successfully"
        });

    } catch (error) {
        console.error('Create lecture error:', {
            error: error,
            message: error.message,
            stack: error.stack
        });
        
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create lecture"
        });
    }
};

export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if(!course){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lectures"
        })
    }
}

export const editLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { lectureTitle, description, contentType, textContent, isPreviewFree } = req.body;
        const files = req.files || {};
        const { video, pdf } = files;

        let lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found"
            });
        }

        // Update basic info
        lecture.lectureTitle = lectureTitle || lecture.lectureTitle;
        lecture.description = description || lecture.description;
        lecture.isPreviewFree = isPreviewFree === 'true';

        // If content type is changing, clean up old content
        if (contentType && contentType !== lecture.contentType) {
            try {
                // Clean up old video if exists
                if (lecture.videoPublicId) {
                    await deleteVideoFromCloudinary(lecture.videoPublicId);
                    lecture.videoUrl = null;
                    lecture.videoPublicId = null;
                }
                // Clean up old PDF if exists
                if (lecture.pdfPublicId) {
                    await deleteMediaFromCloudinary(lecture.pdfPublicId);
                    lecture.pdfUrl = null;
                    lecture.pdfPublicId = null;
                }
                // Clear text content
                lecture.textContent = null;
                
                // Set new content type
                lecture.contentType = contentType;
            } catch (cleanupError) {
                console.error('Content cleanup error:', cleanupError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to cleanup old content'
                });
            }
        }

        // Handle content updates based on type
        try {
            if (contentType === 'video' && video) {
                // Clean up old video if exists
                if (lecture.videoPublicId) {
                    await deleteVideoFromCloudinary(lecture.videoPublicId);
                }
                // Upload new video
                const videoUpload = await uploadMedia(video[0].path, 'video');
                if (!videoUpload) {
                    throw new Error('Failed to upload video');
                }
                lecture.videoUrl = videoUpload.secure_url;
                lecture.videoPublicId = videoUpload.public_id;
            } else if (contentType === 'pdf' && pdf) {
                // Clean up old PDF if exists
                if (lecture.pdfPublicId) {
                    await deleteMediaFromCloudinary(lecture.pdfPublicId);
                }
                // Upload new PDF
                const pdfUpload = await uploadMedia(pdf[0].path, 'pdf');
                if (!pdfUpload) {
                    throw new Error('Failed to upload PDF');
                }
                lecture.pdfUrl = pdfUpload.secure_url;
                lecture.pdfPublicId = pdfUpload.public_id;
            } else if (contentType === 'text' && textContent) {
                lecture.textContent = textContent;
            }
        } catch (uploadError) {
            console.error('Content upload error:', uploadError);
            return res.status(500).json({
                success: false,
                message: uploadError.message || 'Failed to upload new content'
            });
        }

        await lecture.save();

        return res.status(200).json({
            success: true,
            lecture,
            message: "Lecture updated successfully"
        });

    } catch (error) {
        console.error('Edit lecture error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update lecture"
        });
    }
};

export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        // delete the lecture from couldinary as well
        if(lecture.publicId){
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // Remove the lecture reference from the associated course
        await Course.updateOne(
            {lectures:lectureId}, // find the course that contains the lecture
            {$pull:{lectures:lectureId}} // Remove the lectures id from the lectures array
        );

        return res.status(200).json({
            message:"Lecture removed successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to remove lecture"
        })
    }
}
export const getLectureById = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        return res.status(200).json({
            lecture
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lecture by id"
        })
    }
}

export const removeCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        // Find the course
        const course = await Course.findById(courseId).populate('lectures');
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found!"
            });
        }

        // Delete course thumbnail from Cloudinary if exists
        if (course.courseThumbnail) {
            const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
            await deleteMediaFromCloudinary(publicId, 'image');
        }

        // Delete all lecture videos from Cloudinary
        for (const lecture of course.lectures) {
            if (lecture.videoUrl) {
                const publicId = lecture.videoUrl.split("/").pop().split(".")[0];
                await deleteVideoFromCloudinary(publicId);
            }
        }

        // Delete all lectures
        await Lecture.deleteMany({ _id: { $in: course.lectures } });

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success: true,
            message: "Course and all associated content deleted successfully"
        });
    } catch (error) {
        console.error('Remove course error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove course"
        });
    }
};

export const togglePublishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { publish } = req.query;

        console.log('Toggle publish request:', { courseId, publish }); // Debug log

        const course = await Course.findById(courseId).populate('lectures');
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found!"
            });
        }

        // Check if course has lectures before publishing
        if (publish === "true" && (!course.lectures || course.lectures.length === 0)) {
            return res.status(400).json({
                success: false,
                message: "Cannot publish a course without lectures"
            });
        }

        course.isPublished = publish === "true";
        await course.save();

        console.log('Course updated:', { courseId, isPublished: course.isPublished }); // Debug log

        return res.status(200).json({
            success: true,
            message: course.isPublished ? "Course published successfully" : "Course unpublished successfully",
            course
        });
    } catch (error) {
        console.error('Toggle publish error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to update course publish status"
        });
    }
};
