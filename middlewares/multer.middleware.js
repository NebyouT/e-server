import multer from 'multer';
import path from 'path';

// Ensure uploads directory exists
import fs from 'fs';
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const supportedVideoFormats = [
    'video/mp4',
    'video/webm',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
    'video/x-ms-wmv'   // .wmv
];

const fileFilter = (req, file, cb) => {
    // Check file type based on fieldname
    if (file.fieldname === 'video') {
        if (supportedVideoFormats.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported video format. Supported formats: MP4, WebM, MOV, AVI, WMV. Received: ${file.mimetype}`), false);
        }
    } else if (file.fieldname === 'pdf') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
        }
    } else if (file.fieldname === 'courseThumbnail') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only image files are allowed for thumbnails.'), false);
        }
    } else {
        cb(new Error('Invalid field name for file upload.'), false);
    }
};

const limits = {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1 // Only allow 1 file per field
};

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});

// Export different upload configurations
export const uploadSingle = upload.single('courseThumbnail');

export const uploadLecture = (req, res, next) => {
    const uploadFields = upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'pdf', maxCount: 1 }
    ]);

    // Wrap multer upload in try-catch
    try {
        uploadFields(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File is too large. Maximum size is 100MB'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        success: false,
                        message: 'Too many files uploaded'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            } else if (err) {
                // An unknown error occurred
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            
            // Additional validation for content type
            const { contentType } = req.body;
            
            if (contentType === 'video') {
                if (!req.files?.video?.[0]) {
                    return res.status(400).json({
                        success: false,
                        message: 'Video file is required for video content type'
                    });
                }
                
                const videoFile = req.files.video[0];
                if (!supportedVideoFormats.includes(videoFile.mimetype)) {
                    return res.status(400).json({
                        success: false,
                        message: `Unsupported video format. Supported formats: MP4, WebM, MOV, AVI, WMV. Received: ${videoFile.mimetype}`
                    });
                }
            }
            
            if (contentType === 'pdf' && !req.files?.pdf?.[0]) {
                return res.status(400).json({
                    success: false,
                    message: 'PDF file is required for PDF content type'
                });
            }

            // If everything is fine, proceed
            next();
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error processing file upload'
        });
    }
};
