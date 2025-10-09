import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from 'humanize-duration'
import {useAuth , useUser} from "@clerk/clerk-react"
import { toast } from 'react-toastify';
import axios from 'axios'
export const AppContext  = createContext()

export const AppContextprovider = (props)=>{

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    const {getToken} = useAuth();
    const {user}  = useUser()

    const [allCourses , setallCourses] = useState([])
    const [isEducator , setEducator] = useState(false)
    const [EnrolledCourses , setEnrolledCourses] = useState([])
    const[userData , setuserData] = useState(null)
    
    // fetch all courses
    const fetchAllCourses  = async()=>{

       try {
          const {data} = await axios.get(backendUrl + '/api/course/all')
          if(data.success){
            setallCourses(data.course)
          }else{
            toast.error(data.message)
          }

       } catch (error) {
        toast.error(error.message)
       }
    }

// Fetch user data
const fetchUserData = async ()=>{

      if(user.publicMetadata.role === 'eductor')

      try {
        const token = await getToken();
        const {data} = await axios.get(backendUrl + '/api/user/data',
            {headers:{
                Authorization:`Bearer ${token}`
            }}

       ) 

        if(data.success){
            setuserData(data.user)
        }else {
            toast.error(data.message)
        }
      } catch (error) {
          toast.error(error.message)
      }
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
        
        return Math.floor(totalRating / course.courseRatings.length)
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
      try {
         const token = await getToken();
         
         const {data} = await axios.get(backendUrl + '/api/user/enrolled-courses' ,{headers:{
          Authorization:`Bearer ${token}`
         }})
         
         if(data.success){
          setEnrolledCourses(data.enrolledCourses.reverse())   // reverse for getting new courses first 
         }
         else {
          toast.error(data.message)
         }
      } catch (error) {
         toast.error(error.message)
      }
    }
    
    useEffect(()=>{
        fetchAllCourses()
       
    },[])


    useEffect(()=>{
           if(user){
            fetchUserData()
            fetchUserEnrolledCourses()
           }   
    },[user])


    
    const value = {
           currency,allCourses,navigate,calculateRating,isEducator,
           calculateChapterTime,calculateCourseDuration,calculateNoOfLectures,
           EnrolledCourses,fetchUserEnrolledCourses,
           backendUrl , userData ,setuserData,getToken,fetchAllCourses
     }
     return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
     )
}
