// src/employee/EmpNav.jsx
import React from 'react'
import EmpLo from './EmpLo'
import EmpMe from './EmpMe'
import EmpProf from './EmpProf'
import './EmpNav.css'

const EmpNav = ({ logout }) => {
  return (
    <div className='eMain'>
      <article style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <EmpLo/>
        <EmpMe/>
        <EmpProf/>

        <div style={{ marginLeft: 'auto', marginRight: 12 }}>
          {logout ? (
            <button
              onClick={() => {
                try { localStorage.removeItem('hrms_role'); } catch(e) {}
                logout();
              }}
              style={{
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
        </div>
      </article>
    </div>
  )
}

export default EmpNav
