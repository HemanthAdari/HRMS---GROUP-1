import { Eye, EyeOff } from 'lucide-react'; // npm install lucide-react
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import './Login.css';
import profile from '../assets/profile.png'
import hrp from '../assets/image.png'
import EmpNav from '../employee/EmpNav';
import { EmailContext } from './EmailContext';
import { useNavigate } from 'react-router-dom';
import ApplyJobForm from './ApplyJobForm';

const API = 'http://localhost:8080/api/employees/auth';
const Job_API = "http://localhost:8080/api/job-opening/get-all-job";
const APPLY_JOB_API = "http://localhost:8080/api/apply-job";

const Login = ({ setRole }) => {
    const [form, setForm] = useState({ email: '', password: '' });
    const { setEmail } = useContext(EmailContext);
    const [job, setJob] = useState([]);
    const navigate = useNavigate();

    // ⚡ New state for showing ApplyJobForm
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        axios.get(Job_API)
            .then(res => setJob(res.data))
            .catch(err => console.log(err))
    }, []);



    const handleChange = e => {
        e.preventDefault();

        axios.post(API, form)
            .then(res => {
                toast.success("Login success");

                // Example role check
                if (form.email === 'aa@gamil.com' && form.password === 'aaaa') {
                    setRole("hr");   // HR Section will render
                    setEmail(form.email);
                } else {
                    setRole("emp"); // Employee Section will render
                    setEmail(form.email);
                }
            })
            .catch(err => {
                toast.error("Invalid email or password");
                console.log(form)
            });
    };

    // ⚡ Store the job to re-render ApplyJobForm
    const handleApplyClick = (job) => {
        setSelectedJob(job);
    };

    return (
        <div>
            <div className="login-container">
                <div className="login-container-first-div">
                    <h1>HR</h1>
                    <h2>Management System</h2>
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. <br /> Ad earum unde quae cum in, dolor possimus molestiae <br /> excepturi incidunt reiciendis natus vero totam repudiandae <br /> ab vitae qui. Nam, repudiandae deleniti facere magnam <br /> corporis atque voluptates maxime nihil earum ipsam <br /> pariatur officia molestiae? Provident architecto doloribus <br /> non cumque quia, voluptatum fugit eaque officiis ea <br /> magnam quis cum saepe eligendi dicta tempora corporis <br /> enim ut dolores perspiciatis ratione. Numquam laudantium <br /> deserunt harum distinctio. Nulla, possimus dicta! Saepe, <br /> et. Nesciunt ab repellendus possimus maxime dolores <br /> rerum quis itaque, unde autem quidem enim voluptas <br /> vitae, molestiae eos. Repellat, odio dolores nisi quasi <br /> iure aut.</p>

                </div>
                <div className="login-card">
                    {/* Left Section - Welcome */}
                    <div className="welcome-section">
                        <div className="welcome-content">
                            <h1>Welcome</h1>
                            <p>TO HRMS</p>

                        </div>

                        {/* Decorative circles */}
                        <div className="circle circle-1"></div>
                        <div className="circle circle-2"></div>
                        <div className="circle circle-3"></div>
                    </div>

                    {/* Right Section - Login Form */}
                    <div className="login-section">
                        <div className="login-form-container">
                            <h2>Login to HRMS Portal</h2>

                            <form onSubmit={handleChange}>
                                {/* <h1>HRMS</h1> */}
                                <hr className="titleLine" />
                                <img src={profile} alt="" />
                                <br /><hr />
                                <input
                                    type="email"
                                    className='inp'
                                    placeholder='enter email'
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                                <br />
                                <input
                                    type="password"
                                    className='inp'
                                    placeholder='password'
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                                <br /><hr />
                                <input type="submit" className='sub' value='login' />
                            </form>

                            <div className="activate-windows">
                                <span>Activate Windows</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer watermark */}
                <div className="footer-watermark">934 × 524</div>
            </div>




            <div className="job-openings-section">
                <h2>Current Job Openings</h2>

                {/* ⚡ Conditional rendering */}
                {selectedJob ? (
                    <ApplyJobForm job={selectedJob} />
                ) : (
                    <div className="job-cards-container">
                        {job.map((j) => (
                            <div key={j.jobPositionId} className='job-card'>
                                <h3>{j.jobPosition}</h3>
                                <p><b>Location: </b>{j.location}</p>
                                <p><b>Experience: </b>{j.experience}</p>
                                <p><b>Skills: </b>{j.skills}</p>
                                <button onClick={() => handleApplyClick(j)}>Apply Now</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;