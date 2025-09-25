// src/components/ApproveLeave.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../components/NavBar.css";

const API = "http://localhost:8080/api/leave";

const ApproveLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      const arr = Array.isArray(res.data) ? res.data : [];
      console.log("GET /api/leave sample:", arr[0]); // inspect object shape in console
      setLeaves(arr);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // helper: find employee-submitted reason in several possible fields
  const getSubmittedReason = (lv) => {
    if (!lv) return "-";
    return lv.reason ?? lv.leaveReason ?? lv.remarks ?? lv.raw?.reason ?? "-";
  };

  const handleApprove = async (leaveId) => {
    if (!window.confirm("Approve this leave?")) return;
    try {
      await axios.put(`${API}/${leaveId}`, { response: "Yes" });
      toast.success("Leave approved");
      fetchLeaves();
    } catch (err) {
      console.error("Approve failed", err);
      const serverMsg = err?.response?.data || err.message || "Failed to approve";
      toast.error(typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg));
    }
  };

  const handleReject = async (leaveId) => {
    if (!window.confirm("Reject this leave?")) return;
    try {
      await axios.put(`${API}/${leaveId}`, { response: "No" });
      toast.success("Leave rejected");
      fetchLeaves();
    } catch (err) {
      console.error("Reject failed", err);
      const serverMsg = err?.response?.data || err.message || "Failed to reject";
      toast.error(typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>HR Leave Approval</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" style={{ width: "95%", margin: "0 auto" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Date</th>
              <th>Submitted Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No leave requests
                </td>
              </tr>
            )}

            {leaves.map((lv) => {
              const id = lv.leaveId ?? lv.id ?? lv.leave_id ?? "-";
              const email = lv.user?.email ?? lv.email ?? "-";
              const dateStr = (lv.startDate || lv.date || lv.start_date || "").toString().slice(0, 10);
              const submittedReason = getSubmittedReason(lv);
              const status = (lv.status ?? "PENDING").toString();

              return (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{email}</td>
                  <td>{dateStr}</td>
                  <td style={{ maxWidth: 300, whiteSpace: "pre-wrap" }}>{submittedReason}</td>
                  <td>{status}</td>
                  <td>
                    {status === "PENDING" ? (
                      <>
                        <button onClick={() => handleApprove(id)}>Yes</button>
                        <button style={{ marginLeft: 8 }} onClick={() => handleReject(id)}>No</button>
                      </>
                    ) : (
                      <span style={{ color: status === "APPROVED" ? "green" : "red" }}>{status}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApproveLeave;
