import User from '../models/User.models.js'

// get user data
export const getUserData = async (req,res)=>{
    try {
        const userId =  req.auth().userId
        const user  = await User.findById(userId)
        
        if(!user) {
            return res.json({success:false , message:'User not found'});
        }

        res.json({success:true , user})
    } catch (error) {
         return res.json({success:false , message:error.message});
    }
}


// User Enrolled Courses With Lecture Links
export const userEnrolledCourses = async(req,res)=>{
    try {
        const userId = req.auth().userId
        const userData = await User.findById(userId).populate('enrolledCourses')
    
         res.json({success:true , enrolledCourses: userData.enrolledCourses})
    } catch (error) {
          return res.json({success:false , message:error.message});
    }
}