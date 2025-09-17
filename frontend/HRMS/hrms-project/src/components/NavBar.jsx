import React from 'react'
import './NavBar.css'
import Logo from './Logo'
import Menu from './Menu'
import Profile from './Profile'

const NavBar = () => {
  return (
    <div className='main'>
            <article>
                <Logo />
                <Menu />
                <Profile />
            </article>
        </div>
  )
}

export default NavBar
