import React from 'react'
import EmpLo from './EmpLo'
import EmpMe from './EmpMe'
import EmpProf from './EmpProf'
import './EmpNav.css'

const EmpNav = () => {
  return (
    <div className='eMain'>
      <article>
        <EmpLo/>
        <EmpMe/>
        <EmpProf/>
      </article>
    </div>
  )
}

export default EmpNav
