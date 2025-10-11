import User from '../models/User.models.js'
import { Purchase } from "../models/Purchase.js"
import Course from '../models/Course.models.js'
import Stripe from 'stripe';
import CourseProgress from '../models/CourseProgress.js';

// get user data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth().userId
        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


// User Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth().userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


// purchase course
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const { origin } = req.headers
        const userId = req.auth().userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data not found' })
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData)

        // stripe Gateway Initialization

        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY

        // creating line items for Stripe
        const line_items = [{
            price_data: {
                currency, 
                product_data: {
                    name:courseData.courseTitle
                },
                unit_amount:Math.floor(newPurchase.amount) * 100
            },
            quantity:1
        }]


        const session = await stripeInstance.checkout.sessions.create({
           success_url:`${origin}/loading/my-enrollments`,
           cancel_url:`${origin}/`,
           line_items:line_items,
           mode:'payment',
           metadata:{
            purchaseId : newPurchase._id.toString()
           } 
        })

      res.json({success:true , session_url: session.url})

    } catch (error) {
        res.json({success:false , session_Url: error.message})

    }
}

// update user Course Progress
 export const updateUserCourseProgress = async (req,res)=>{
    try {
        const userId  = req.auth().userId
        const {courseID , lectureId} = req.body
        const progressData = await CourseProgress.findOne({userId ,courseID});
    
        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.json({success:true ,message:'lecture already completed'})
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save();

        }else{
             await CourseProgress.create({
                userId,
                courseID,
                lectureCompleted:[lectureId]
             })
             res.json({success:true ,message:'progress updated'})
        }
    } catch (error) {
         res.json({success:false , message:error.message})        
    }
 }


//  get use course progress
export const getUserProgress = async(req,res)=>{
     try {
        const userId  = req.auth().userId
        const {courseID , lectureId} = req.body
        const progressData = await CourseProgress.findOne({userId ,courseID});
    
         res.json({success:true , progressData})
     } catch (error) {
        res.json({success:false , message:error.message})   
     }
}

// add user ratings to course
export const addUserRating = async (req,res)=>{
    const userId = req.auth().userId;
    const {courseID,rating} = req.body;

    if(!courseID || !userId || !rating || rating<1 || rating > 5){
       return res.json({success:false , message:'Invalid Details'});
    }

    try {
        const course = await Course.findById(courseID)
        if(!course){
            return res.json({success:false , message:'Course not found.'})
        }

        const user = await User.findById(userId)
        if(!user || !user.enrolledCourses.includes(courseID)){
            return res.json({success:false , message:'user has not purchased this course. '});
        }

        const existingRatingIndex = course.courseRatings.findIndex(r=>r.userId === userId)

        if(existingRatingIndex > -1) {
            course.courseRatings[existingRatingIndex].rating  = rating
        }else{
            course.courseRatings.push({userId ,rating});
        }
        await course.save()
        return res.json({success:true ,message:'Rating added'})
 
    } catch (error) {
         res.json({success:false , message:error.message})        
    }
}