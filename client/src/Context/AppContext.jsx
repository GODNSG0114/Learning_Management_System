import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
export const AppContext  = createContext()

export const AppContextprovider = (props)=>{
    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()
    const [allCourses , setallCourses] = useState([])
    const [isEducator , setEducator] = useState(true)
    
    // fetch all courses
    const fetchAllCourses  = async()=>{
        setallCourses(dummyCourses)
    }

useEffect(()=>{
    fetchAllCourses()
},[])

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



    const value = {
           currency,allCourses,navigate,calculateRating,isEducator
     }
     return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
     )
}
