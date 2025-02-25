import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    courseTitle:{
        type:String,
        required:true
    },
    subTitle: {type:String}, 
    description:{ type:String},
    category:{
        type:String,
        required:true
    },
    courseLevel:{
        type:String,
        enum:["Beginner", "Medium", "Advance"]
    },
    coursePrice:{
        type:Number
    },
    courseThumbnail:{
        type:String
    },
    enrolledStudents:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    lectures:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Lecture"
        }
    ],
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    isPublished:{
        type:Boolean,
        default:false
    }
}, {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual for total lectures count
courseSchema.virtual('totalLectures').get(function() {
    return this.lectures?.length || 0;
});

export const Course = mongoose.model("Course", courseSchema);