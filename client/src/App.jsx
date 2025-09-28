import React from 'react'
import { Routes ,Route, useMatch} from 'react-router-dom'
import Home from './Pages/Student/Home'
import CourseDetails from './Pages/Student/CourseDetails'
import CourseList from './Pages/Student/CourseList'
import MyEnrollement from './Pages/Student/MyEnrollments'
import Player from './Pages/Student/Player'
import Loading from './Components/Student/Loading'
import Educators from './Pages/Educator/Educators'
import DashBoard from './Pages/Educator/DashBoard'
import AddCourse from './Pages/Educator/AddCourse'
import Mycourses from './Pages/Educator/Mycourses'
import StudentEnrolled from './Pages/Educator/StudentEnrolled'
import Navbar from './Components/Student/Navbar'
import "quill/dist/quill.snow.css"
const App = () => {

const isEducatorRoute = useMatch('/educator/*');

  return (
<>
    <div className='text-default min-h-screen bg-white'>
      {!isEducatorRoute && <Navbar/>}
      
      <Routes>
        <Route path='/' element = {<Home/>}/>
        <Route path='/course-list' element={<CourseList/>}/>
        <Route path='/course-list/:input' element={<CourseList/>} />
        <Route path='/course/:id' element ={<CourseDetails/>}/>
        <Route path='/my-enrollments' element={<MyEnrollement/>}/>
        <Route path='/player/:courseID' element={<Player/>}/>
        <Route path='/loading/:path' element={<Loading/>}/>
            
        <Route path='/educator' element={<Educators/>}>
           <Route path='/educator' element={<DashBoard/>}/>
           <Route path='add-course' element={<AddCourse/>}/>
           <Route path='my-courses' element={<Mycourses/>}/>
           <Route path='student-enrolled' element={<StudentEnrolled/>}/>
        </Route>
      </Routes>
    </div>
    </>
  )
}

export default App