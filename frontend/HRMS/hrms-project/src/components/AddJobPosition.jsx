import axios from 'axios';
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import '../job/Job.css'
import { useNavigate } from 'react-router-dom';

const API = "http://localhost:8080/api/job-opening";

const AddJobPosition = () => {

    const navigate = useNavigate(); // ✅ navigation hook


    const [job, setJob] = useState({
        jobPosition: "",
        location: "",
        experience: "",
        skills: ""
    });

    const handleJob = e => {
        e.preventDefault();

        axios.post(API, job)
        .then(res => {
            toast.success("Job addedd successfully");
            navigate("/"); // ✅ redirect after success
        })
        .catch(err=> {
            toast.error("Job not added");
            console.log("err");
        })
    }

  return (
    <div className="add-job-container">
      <form className="add-job-form" onSubmit={handleJob}>
        <input 
        type="text" 
        placeholder='enter job position' 
        value={job.jobPosition} 
        onChange={(e)=> setJob({...job, jobPosition:e.target.value})}
        />
        <br />
        <input 
        type="text" 
        placeholder='enter location' 
        value={job.location} 
        onChange={(e)=> setJob({...job, location:e.target.value})}
        />
        <br />
        <input 
        type="text" 
        placeholder='enter experience' 
        value={job.experience} 
        onChange={(e)=> setJob({...job, experience:e.target.value})}
        />
        <br />
        <input 
        type="text" 
        placeholder='enter skills' 
        value={job.skills} 
        onChange={(e)=> setJob({...job, skills:e.target.value})}
        />
        <br />
        <input type="submit" />
      </form>
    </div>
  )
}

export default AddJobPosition
