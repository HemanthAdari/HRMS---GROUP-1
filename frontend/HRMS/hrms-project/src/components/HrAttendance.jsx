// src/components/HrAttendance.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * HR Attendance UI - robust fetch
 * - Attempts GET /api/attendance/all then falls back to /api/attendance if 404
 * - Filters client-side by email and date range
 * - Small inline styles so drop-in works without extra CSS
 */

const ATT_API_TRY_1 = "http://localhost:8080/api/attendance/all";
const ATT_API_FALLBACK = "http://localhost:8080/api/attendance";

const containerStyle = {
  padding: "28px",
  maxWidth: "1100px",
  margin: "24px auto",
  background: "#f9efe2",
  borderRadius: "12px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "18px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#333",
};

const controlsRow = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  justifyContent: "flex-start",
  marginBottom: "16px",
  flexWrap: "wrap",
};

const inputStyle = {
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid #cfcfcf",
  minWidth: "220px",
  outline: "none",
};

const dateStyle = { ...inputStyle, width: "150px" };

const buttonStyle = {
  padding: "9px 14px",
  borderRadius: "6px",
  border: "none",
  background: "#1177ee",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const smallMuted = { color: "#666", fontSize: "13px", marginLeft: "6px" };

const tableWrap = {
  overflowX: "auto",
  borderRadius: "8px",
  background: "#fff",
  padding: "8px",
  boxShadow: "inset 0 1px 0 #eee",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "900px",
};

const thStyle = {
  background: "#1e90ff",
  color: "#fff",
  padding: "12px 10px",
  textAlign: "center",
  fontWeight: 700,
  borderTopLeftRadius: "6px",
  borderTopRightRadius: "6px",
};

const tdStyle = {
  padding: "12px 10px",
  borderBottom: "1px solid #eee",
  textAlign: "center",
};

const noDataStyle = {
  padding: "18px",
  textAlign: "center",
  color: "#666",
};

function formatDateISO(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const HrAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  // default date range -> first and last day of current month
  useEffect(() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(formatDateISO(first));
    setEndDate(formatDateISO(last));
  }, []);

  useEffect(() => {
    fetchAttendanceWithFallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // try /all then fallback to /api/attendance
  const fetchAttendanceWithFallback = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(ATT_API_TRY_1);
      setAttendance(Array.isArray(res.data) ? res.data : []);
      console.info("Fetched using", ATT_API_TRY_1);
    } catch (err) {
      // if 404 try fallback, otherwise report
      if (err.response && err.response.status === 404) {
        console.warn(`${ATT_API_TRY_1} returned 404, trying fallback ${ATT_API_FALLBACK}`);
        try {
          const res2 = await axios.get(ATT_API_FALLBACK);
          setAttendance(Array.isArray(res2.data) ? res2.data : []);
          console.info("Fetched using", ATT_API_FALLBACK);
        } catch (err2) {
          console.error("Fallback fetch failed:", err2);
          setError("Unable to fetch attendance from server.");
          setAttendance([]);
        }
      } else {
        console.error("Failed to fetch attendance:", err);
        setError("Unable to fetch attendance from server.");
        setAttendance([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    // client side filtering; refresh from server first
    fetchAttendanceWithFallback();
  };

  // client-side filtered list
  const filtered = attendance.filter((att) => {
    const userEmail = att?.user?.email ?? "";
    if (searchEmail && !userEmail.toLowerCase().includes(searchEmail.toLowerCase())) {
      return false;
    }
    if (startDate) {
      const start = new Date(startDate);
      const rec = new Date(att.date);
      if (rec < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      const rec = new Date(att.date);
      if (rec > end) return false;
    }
    return true;
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>HR — Attendance & Leaves Overview</div>

      <form style={controlsRow} onSubmit={handleSearch}>
        <input
          placeholder="Search by email"
          style={inputStyle}
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              handleSearch(ev);
            }
          }}
        />

        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          Start:
          <input
            type="date"
            style={dateStyle}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          End:
          <input
            type="date"
            style={dateStyle}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <button style={buttonStyle} onClick={handleSearch}>
          Search
        </button>

        <button
          type="button"
          onClick={() => {
            setSearchEmail("");
            const now = new Date();
            setStartDate(formatDateISO(new Date(now.getFullYear(), now.getMonth(), 1)));
            setEndDate(formatDateISO(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
            fetchAttendanceWithFallback();
          }}
          style={{ ...buttonStyle, background: "#777", marginLeft: 8 }}
        >
          Reset
        </button>

        <div style={smallMuted}>{loading ? "Loading..." : `${filtered.length} record(s)`}</div>
      </form>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "#444" }}>
          Tip: click <b>Search</b> after changing criteria — date range is inclusive.
        </span>
      </div>

      <div style={tableWrap}>
        {error && <div style={{ color: "crimson", padding: 8 }}>{error}</div>}

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 60 }}>ID</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Employee Name</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Attendance Status</th>
              <th style={thStyle}>Remarks / Leave Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={noDataStyle}>
                  Loading attendance...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={noDataStyle}>
                  No records found
                </td>
              </tr>
            ) : (
              filtered.map((att) => (
                <tr key={att.attendanceId}>
                  <td style={tdStyle}>{att.attendanceId}</td>
                  <td style={tdStyle}>{att.user?.email ?? "-"}</td>
                  <td style={tdStyle}>
                    {att.user?.firstName ?? ""} {att.user?.lastName ?? ""}
                  </td>
                  <td style={tdStyle}>{att.date ?? "-"}</td>
                  <td style={tdStyle}>{att.status ?? "-"}</td>
                  <td style={tdStyle}>{att.remarks ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HrAttendance;
