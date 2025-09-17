import axios from 'axios';
import React, { useEffect, useState } from 'react'

const Job_API = "http://localhost:8080/api/job-opening/get-all-job";

const GetAllJob = () => {

    const [job, setJob] = useState([]);

    useEffect(() => {
        axios.get(Job_API)
            .then(res => setJob(res.data))
            .catch(err => console.log(err))
    }, []);

    return (
        <div>
            <div className="job-openings-section">
                <h2>Current Job Openings</h2>
                <div className="job-cards-container">

                    {
                        job.map((j, i) => {
                            return (
                                <div key={j.jobPositionId} className='job-card'>
                                    <h3>{j.jobPosition}</h3>
                                    <p><b>Location: </b>{j.location}</p>
                                    <p><b>Experience: </b>{j.experience}</p>
                                    <p><b>Skills: </b>{j.skills}</p>
                                    <button>Apply Now</button>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default GetAllJob
