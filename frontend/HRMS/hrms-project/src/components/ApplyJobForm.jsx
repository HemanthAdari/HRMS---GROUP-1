import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../job/Job.css'

const APPLY_JOB_API = "http://localhost:8080/api/apply-job";

const ApplyJobForm = ({ job }) => {
    const [form, setForm] = useState({
        email: "",
        jobPositionId: "",
        jobPosition: "",
        location: "",
        experience: "",
        skills: ""
    });

    // ✅ Pre-fill jobPositionId & jobPosition when job is passed
    useEffect(() => {
        if (job) {
            setForm((prev) => ({
                ...prev,
                jobPositionId: job.jobPositionId,
                jobPosition: job.jobPosition
            }));
        }
    }, [job]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                jobPositionId: job.jobPositionId,
                jobPosition: job.jobPosition
            };

            await axios.post(APPLY_JOB_API, payload);
            toast.success("Application submitted!");
        } catch (err) {
            toast.error("Failed to apply");
        }
    };

    return (
        <div className='aply-job-form-fir-div'>
            <h2>Apply for {job?.jobPosition}</h2>
            <form className='aply-job-form-fir-div-form' onSubmit={handleSubmit}>
                <label>Email : </label>
                <input
                    type="email"
                    placeholder="enter email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <br />

                <label>Job position id : </label>
                <input type="text" value={form.jobPositionId} readOnly />
                <br />

                <label>Job position : </label>
                <input type="text" value={form.jobPosition} readOnly />
                <br />

                <label>Enter location : </label>
                <input
                    type="text"
                    placeholder="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
                <br />

                <label>Enter experience : </label>
                <input
                    type="text"
                    placeholder="experience"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
                <br />

                <label>Enter skills : </label>
                <input
                    type="text"
                    placeholder="skills"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                />
                <br />

                <button type="submit">Submit Application</button>
            </form>
        </div>
    );
};

export default ApplyJobForm;
