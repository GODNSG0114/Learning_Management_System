import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../Components/Educator/Navbar'
import Sidebar from '../../Components/Educator/Sidebar'
const Educators = () => {
  return (
   <>
    <Navbar/>
    <div className='flex'>
      <Sidebar/>
    </div>
  <div>
    {<Outlet/>}
  </div>
   </>
  )
}

export default Educators