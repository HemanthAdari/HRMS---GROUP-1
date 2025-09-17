import React from 'react'
import { Link } from 'react-router-dom'

const EmpMe = () => {
  return (
    <div className='eMenu'>
      <Link to='/e/dash'>Dashboard</Link>
      <Link to='/e/att'>Attendance</Link>
      <Link to='/e/lea'>Leave</Link>
      <Link to='/e/ale'>Approve leave</Link>
    </div>
  )
}

export default EmpMe
