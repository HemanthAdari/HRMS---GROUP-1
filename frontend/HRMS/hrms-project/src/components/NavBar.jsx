// src/components/NavBar.jsx
import React from 'react'
import './NavBar.css'
import Logo from './Logo'
import Menu from './Menu'
import Profile from './Profile'
import { Link } from 'react-router-dom'

const NavBar = ({ logout }) => {
  return (
    <div className='main'>
      <article style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Logo />
        <Menu />

        <nav style={{ marginLeft: 'auto', marginRight: 20 }}>
          <Link to="/a/pending-users" style={{ marginRight: 12, textDecoration: 'none', color: '#333' }}>
            Pending Users
          </Link>
          <Link to="/a/emp" style={{ marginRight: 12, textDecoration: 'none', color: '#333' }}>
            Employees
          </Link>
          {/* Logout button shown only when App passes logout prop */}
          {logout ? (
            <button
              onClick={() => {
                // keep tidy: clear localStorage and call upstream logout
                try { localStorage.removeItem('hrms_role'); } catch(e){/*ignore*/}
                logout();
              }}
              style={{
                marginLeft: 8,
                padding: '6px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                background: '#e74c3c',
                color: '#fff',
                border: 'none'
              }}
            >
              Logout
            </button>
          ) : null}
        </nav>

        <Profile />
      </article>
    </div>
  )
}

export default NavBar
