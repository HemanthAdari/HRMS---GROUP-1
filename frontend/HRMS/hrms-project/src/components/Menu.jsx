import React from 'react'
import './NavBar.css'
import { Link } from 'react-router-dom'

const Menu = () => {
  return (
    <div className='menu'>
      <Link to='/'>Dashboard</Link>
      <Link to='/a/emp'>Employees</Link>
      <Link to='/a/att'>Attendance</Link>
      <Link to='/a/leave/request'>Leave</Link>

      {/* <div className="dropdown">
        <span className="dropbtn">Leave Management ▾</span>
        <div className="dropdown-content">
          <Link to='/a/leave/request'>Request Leave</Link>
          <Link to='/a/leave/approved'>Approved Leave</Link>
        </div>
      </div> */}

      <Link to='/a/sal'>Salary</Link>
    </div>
  )
}

export default Menu
