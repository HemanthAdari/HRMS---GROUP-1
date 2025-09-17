import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import '../job/Job.css'

const JOB_API = "http://localhost:8080/api/job-opening";

const GetSingleJob = () => {
    const [id, setId] = useState(""); // simple string for search
    const [job, setJob] = useState({
        jobPositionId: "",
        jobPosition: "",
        location: "",
        experience: "",
        skills: "",
    });

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [updatedJob, setUpdatedJob] = useState({ ...job });

    // 🔍 Find job by ID
    const findPosition = (e) => {
        e.preventDefault();

        axios
            .get(`${JOB_API}/${id}`)
            .then((res) => {
                setJob(res.data);
                setUpdatedJob(res.data); // copy for editing
                toast.success("Job found");
            })
            .catch((err) => {
                toast.error("Job not found");
                console.error(err);
            });
    };

    // ❌ Delete job
    const deleteJob = () => {
        axios
            .delete(`${JOB_API}/${job.jobPositionId}`)
            .then(() => {
                toast.success(`Job ${job.jobPosition} deleted successfully`);
                setJob({
                    jobPositionId: "",
                    jobPosition: "",
                    location: "",
                    experience: "",
                    skills: "",
                });
                setShowDeletePopup(false);
            })
            .catch((err) => {
                toast.error("Error deleting job");
                console.error(err);
            });
    };

    // ✏️ Update job
    const updateJob = () => {
        axios
            .put(`${JOB_API}/${job.jobPositionId}`, updatedJob)
            .then((res) => {
                toast.success("Job updated successfully");
                setJob(res.data);
                setShowUpdatePopup(false);
            })
            .catch((err) => {
                toast.error("Error updating job");
                console.error(err);
            });
    };

    return (
        <div className="first-div-single-job">
            {/* Search Form */}
            <form onSubmit={findPosition} className="first-div-single-job-form">
                <input
                    type="text"
                    placeholder="Enter job position id"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="first-div-single-job-form-fir-inp"
                />
                <input type="submit" value="Search"
                    className="first-div-single-job-form-sec-inp"
                />
            </form>

            {/* Job Details */}
            {job.jobPositionId && (
                <div className="second-div-single-job">
                    <input type="text" value={job.jobPositionId} readOnly />
                    <br />
                    <input type="text" value={job.jobPosition} readOnly />
                    <br />
                    <input type="text" value={job.location} readOnly />
                    <br />
                    <input type="text" value={job.experience} readOnly />
                    <br />
                    <input type="text" value={job.skills} readOnly />
                    <br />
                    <button
                        className="second-div-single-job-upd-btn"
                        onClick={() => setShowUpdatePopup(true)}>Update</button>
                    <button
                        className="second-div-single-job-del-btn"
                        onClick={() => setShowDeletePopup(true)}>Delete</button>
                </div>
            )}

            {/* Delete Popup */}
            {showDeletePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <p>
                            Are you sure you want to delete job{" "}
                            <b>{job.jobPositionId} - {job.jobPosition}</b>?
                        </p>
                        <button className="third-div-single-job-y-del" onClick={deleteJob}>
                            Yes, Delete
                        </button>
                        <button className="third-div-single-job-n-del" onClick={() => setShowDeletePopup(false)}>
                            No
                        </button>
                    </div>
                </div>
            )}

            {/* Update Popup */}
            {showUpdatePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Update Job</h3>
                        <input
                            type="text"
                            placeholder="Job Position Name"
                            value={updatedJob.jobPosition}
                            onChange={(e) => setUpdatedJob({ ...updatedJob, jobPosition: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Update Job Location"
                            value={updatedJob.location}
                            onChange={(e) => setUpdatedJob({ ...updatedJob, location: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Update Job Experience"
                            value={updatedJob.experience}
                            onChange={(e) => setUpdatedJob({ ...updatedJob, experience: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Update Job Skills"
                            value={updatedJob.skills}
                            onChange={(e) => setUpdatedJob({ ...updatedJob, skills: e.target.value })}
                        />
                        <button className="forth-div-single-job-save" onClick={updateJob}>
                            Save
                        </button>
                        <button className="forth-div-single-job-can" onClick={() => setShowUpdatePopup(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default GetSingleJob;
