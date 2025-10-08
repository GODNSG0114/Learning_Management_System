import Course from "../models/Course.models.js";

// Get All Courses
export const getAllCourse = async (req , res)=>{
    try {
        const course = await Course.find({isPublished:true}).
        select(['-courseContent' ,'-enrolledStudent']).populate({path:'educator'})

         res.json({success:true ,course})

    } catch (error) {
          res.json({success:false , message:error.message});
    }
}

// Get Course By id

export const GetCourseById = async(req,res)=>{
     const {id} = req.params
    try {   
        const courseData = await Course.findById(id).populate({path:'educator'})
    
        // Remove lectureUrl if isPreviewFree is false
        courseData.courseContent.forEach(chapter=>{
            chapter.chapterContent.forEach(lecture=>{
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl = '';
                }
            })
        })

         res.json({success:true , courseData})

    } catch (error) {
        res.json({success:false , message:error.message});
    }
}