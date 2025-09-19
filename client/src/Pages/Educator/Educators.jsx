import React from 'react'
import { Outlet } from 'react-router-dom'
const Educators = () => {
  return (
   <>
  <h1>Educator</h1>
  <div>
    {<Outlet/>}
  </div>
   </>
  )
}

export default Educators