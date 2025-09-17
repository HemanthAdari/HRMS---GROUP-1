import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import '../job/Job.css'

const API = "http://localhost:8080/api/apply-job";

const ApplyJobsPositionEmp = () => {
  const [applications, setApplications] = useState([]);

  // Fetch all job applications
  const fetchApplications = () => {
    axios
      .get(API)
      .then((res) => setApplications(res.data))
      .catch((err) => toast.error("Error fetching job applications"));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Delete application by id
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      axios
        .delete(`${API}/${id}`)
        .then(() => {
          toast.success("Application deleted successfully");
          fetchApplications(); // refresh list
        })
        .catch(() => toast.error("Error deleting application"));
    }
  };

  return (
    <div className="fir-div-apl-job-pos-emp" style={{ padding: "20px" }}>
      <h2>All Job Applications</h2>
      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <table className="fir-div-apl-job-pos-emp-table" border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Job Position</th>
              <th>Location</th>
              <th>Experience</th>
              <th>Skills</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.applyJobId}>
                <td>{app.applyJobId}</td>
                <td>{app.email}</td>
                <td>{app.jobPosition}</td>
                <td>{app.location}</td>
                <td>{app.experience}</td>
                <td>{app.skills}</td>
                <td>
                  <button
                    onClick={() => handleDelete(app.applyJobId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApplyJobsPositionEmp;
