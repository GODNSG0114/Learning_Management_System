import React, { useContext, useState } from 'react'
import { AppContext } from '../../Context/AppContext'
import { Line } from 'rc-progress'
import Footer from '../../Components/Student/Footer'

const MyEnrollments = () => {

  const { EnrolledCourses, calculateCourseDuration, navigate } = useContext(AppContext)
  console.log(EnrolledCourses)
  // ⚠️ NOTE: This progressArray should come from the user's actual enrollment data (backend/context)
  // relying on index correlation is unreliable.
  const [progressArray ,setprogressArray] = useState([
    {lectureCompleted:2 , totalLectures:4},
  ])

  return (
    <>
      <div className='md:px-36 px-8 pt-10 min-h-screen'>
        <h1 className='text-2xl font-semibold'>My Enrollments</h1>
        <table className='md:table-auto table-fixed w-full overflow-hidden border mt-10'>
          <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden'>
            <tr>
              <th className='px-4 py-3 font font-semibold truncate'>Course</th>
              <th className='px-4 py-3 font font-semibold truncate'>Duration</th>
              <th className='px-4 py-3 font font-semibold truncate'>Completed</th>
              <th className='px-4 py-3 font font-semibold truncate'>Status</th>
            </tr>
          </thead>
          <tbody className='text-gray-700'>
            {
              // Using course._id as the key for stability
              EnrolledCourses.map((course, index) => {
                const progress = progressArray[index] || { lectureCompleted: 0, totalLectures: 1 };
                const percentCompleted = (progress.lectureCompleted * 100) / progress.totalLectures;

                return (
                  <tr key={course._id} className='border-b border-gray-500/20'>
                    <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3'>
                      {/* Added descriptive alt attribute */}
                      <img src={course.courseThumbnail} alt={`Thumbnail for ${course.courseTitle}`} className='w-14 sm:w-24 md:w-28' />
                      <div className='flex-1'>
                        {/* 🐛 FIX: Correctly rendered courseTitle */}
                        <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                        <Line 
                            className='bg-gray-300 rounded-full' 
                            strokeWidth={2} 
                            percent={percentCompleted}
                            strokeColor={percentCompleted === 100 ? '#10B981' : '#3B82F6'} // Optional: different color for completed
                        />
                      </div>
                    </td>
                    <td className='px-4 py-3 max-sm:hidden'>
                      {calculateCourseDuration(course)}
                    </td>
                    <td className='px-4 py-3 max-sm:hidden'>
                      {`${progress.lectureCompleted} / ${progress.totalLectures} `} <span>lectures</span>
                    </td>
                    <td className='px-4 py-3 max-sm:text-right'>
                      <button 
                        className=' rounded-3xl px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white '
                        onClick={() => navigate('/player/' + course._id)} 
                      >
                        {progress.lectureCompleted === progress.totalLectures ? 'Completed' : 'On Going'}
                      </button>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
      <Footer/>
    </>
  )
}

export default MyEnrollments