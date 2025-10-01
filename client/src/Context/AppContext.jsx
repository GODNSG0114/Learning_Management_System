import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from 'humanize-duration'
import {useAuth , useUser} from "@clerk/clerk-react"
export const AppContext  = createContext()

export const AppContextprovider = (props)=>{
    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    const {getToken} = useAuth();
    const {user}  = useUser()

    const [allCourses , setallCourses] = useState([])
    const [isEducator , setEducator] = useState(true)
    const [EnrolledCourses , setEnrolledCourses] = useState([])
    
    // fetch all courses
    const fetchAllCourses  = async()=>{
        setallCourses(dummyCourses)
    }

    
    // function to calculate averageb rating for course 
    const calculateRating = (course)=>{
        if(course.courseRatings.length === 0){
            return 0;
        }
        
        let totalRating = 0;
        course.courseRatings.forEach(rating =>{
            totalRating += rating.rating
        })
        
        return totalRating / course.courseRatings.length
    }
    
    // Function to calculate Course Chapter Time
    const calculateChapterTime = (chapter)=>{
        let time = 0
        chapter.chapterContent.map((lecture)=> time+=lecture.lectureDuration)
        return humanizeDuration(time*60*1000 ,{units:["h", "m"]})
    }
    
    //  Function to calculate course duration 
    const calculateCourseDuration = (course)=>{
        let time = 0;
        course.courseContent.map((chapter)=>chapter.chapterContent.map((lecture)=>time+=lecture.lectureDuration))
        return humanizeDuration(time*60*1000 ,{units:["h","m"]})
    }
    
    //    function to calculate number of lectures in th course
    const calculateNoOfLectures = (course)=>{
        let totalLec = 0;
        course.courseContent.forEach(chapter=>{
            if(Array.isArray(chapter.chapterContent)){
                totalLec+=chapter.chapterContent.length;
            }
        })
        return totalLec;
    }

    // Fetch user enrolled courses 
    const fetchUserEnrolledCourses = async()=>{
       setEnrolledCourses(dummyCourses)
    }
    
    useEffect(()=>{
        fetchAllCourses()
        fetchUserEnrolledCourses()
    },[])



     const logToken = async()=>{
        console.log(await getToken());
     }
    useEffect(()=>{
           if(user){
            logToken( )
           }   
    },[user])


    
    const value = {
           currency,allCourses,navigate,calculateRating,isEducator,
           calculateChapterTime,calculateCourseDuration,calculateNoOfLectures,
           EnrolledCourses,fetchUserEnrolledCourses
     }
     return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
     )
}
