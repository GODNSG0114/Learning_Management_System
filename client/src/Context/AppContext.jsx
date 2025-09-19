import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
export const AppContext  = createContext()

export const AppContextprovider = (props)=>{
    const currency = import.meta.env.VITE_CURRENCY
    const [allCourses , setallCourses] = useState([])
    
    // fetch all courses
    const fetchAllCourses  = async()=>{
        setallCourses(dummyCourses)
    }

useEffect(()=>{
    fetchAllCourses()
},[])

    const value = {
           currency,allCourses
     }
     return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
     )
}
