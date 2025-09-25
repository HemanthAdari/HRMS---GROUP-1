// src/components/Salary.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Menu.css"; // optional: your project styles

const EMP_API = "http://localhost:8080/api/employees";
const ATT_API = "http://localhost:8080/api/attendance";
const LEAVE_API = "http://localhost:8080/api/leave";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function normalizeEmailFromEntity(obj) {
  if (!obj) return "";
  if (obj.email) return String(obj.email).trim().toLowerCase();
  if (obj.user && obj.user.email) return String(obj.user.email).trim().toLowerCase();
  if (obj.user && obj.user.emailAddress) return String(obj.user.emailAddress).trim().toLowerCase();
  return "";
}

function parseDateSafe(d) {
  if (!d) return null;
  // If already Date
  if (d instanceof Date) return d;
  // If string like "2025-09-25" or ISO
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// compute inclusive days between start & end
function daysBetweenInclusive(start, end) {
  const s = parseDateSafe(start);
  const e = parseDateSafe(end);
  if (!s || !e) return 0;
  const diff = Math.floor((e.setHours(0,0,0,0) - s.setHours(0,0,0,0)) / (24 * 3600 * 1000));
  return diff >= 0 ? diff + 1 : 0;
}

const Salary = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leave, setLeave] = useState([]);
  const [summary, setSummary] = useState([]);
  const [editRowEmail, setEditRowEmail] = useState(null);
  const [newSalary, setNewSalary] = useState("");
  const [selectedDates, setSelectedDates] = useState({}); // { email: { month, year } }
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [rEmp, rAtt, rLeave] = await Promise.allSettled([
        axios.get(EMP_API),
        axios.get(ATT_API),
        axios.get(LEAVE_API),
      ]);

      if (rEmp.status === "fulfilled") setEmployees(Array.isArray(rEmp.value.data) ? rEmp.value.data : []);
      else {
        console.error("Failed to load employees:", rEmp.reason);
        toast.error("Failed to load employees");
      }

      if (rAtt.status === "fulfilled") setAttendance(Array.isArray(rAtt.value.data) ? rAtt.value.data : []);
      else {
        console.error("Failed to load attendance:", rAtt.reason);
        toast.warn("Failed to load attendance (server).");
      }

      if (rLeave.status === "fulfilled") setLeave(Array.isArray(rLeave.value.data) ? rLeave.value.data : []);
      else {
        console.error("Failed to load leaves:", rLeave.reason);
        toast.warn("Failed to load leaves (server).");
      }
    } finally {
      setLoading(false);
    }
  }

  // recompute summary when data changes
  useEffect(() => {
    computeSummary();
  }, [employees, attendance, leave]);

  function computeSummary() {
    // group by normalized email (from employee.user.email)
    const map = new Map();

    // seed from employees (so we have salary and employeeId)
    employees.forEach(emp => {
      const email = normalizeEmailFromEntity(emp);
      if (!email) return;
      map.set(email, {
        email,
        displayEmail: emp.user?.email || emp.email || "",
        fullName: emp.user?.firstName ? `${emp.user.firstName} ${emp.user.lastName || ""}` : (emp.fullName || `${emp.firstName || ""} ${emp.lastName || ""}`),
        employeeId: emp.employeeId,
        phone: emp.phone || emp.user?.phone || "",
        address: emp.address || "",
        gender: emp.gender || "",
        hireDate: emp.hireDate || "",
        salary: emp.salary ?? 0,
        fullDay: 0,
        halfDay: 0,
        absent: 0,
        leaveDays: 0
      });
    });

    // accumulate attendance rows
    attendance.forEach(a => {
      const em = String(a.email || a.user?.email || "").trim().toLowerCase();
      if (!em) return;
      const rec = map.get(em);
      if (!rec) {
        // attendance for unknown employee - optionally create record
        map.set(em, {
          email: em,
          displayEmail: a.email || a.user?.email || em,
          fullName: a.user?.firstName ? `${a.user.firstName} ${a.user.lastName || ""}` : "",
          employeeId: null,
          phone: a.user?.phone || "",
          address: "",
          gender: "",
          hireDate: "",
          salary: 0,
          fullDay: 0,
          halfDay: 0,
          absent: 0,
          leaveDays: 0
        });
      }
      const target = map.get(em);
      const status = (a.status || a.attendance || "").toString().toLowerCase();
      if (status.includes("full") || status.includes("present_full") || status === "full_day") target.fullDay++;
      else if (status.includes("half")) target.halfDay++;
      else if (status.includes("absent")) target.absent++;
    });

    // accumulate leave days (approved only)
    leave.forEach(lv => {
      const em = String(lv.email || lv.user?.email || "").trim().toLowerCase();
      if (!em) return;
      const approved = String(lv.response || lv.status || "").toLowerCase() === "yes" || String(lv.status || "").toUpperCase() === "APPROVED";
      if (!approved) return;

      // calculate days:
      let days = 0;
      if (lv.days && Number(lv.days) > 0) days = Number(lv.days);
      else if (lv.startDate && lv.endDate) days = daysBetweenInclusive(lv.startDate, lv.endDate);
      else if (lv.date) days = 1;
      else days = 1;

      if (!map.has(em)) {
        map.set(em, {
          email: em,
          displayEmail: lv.email || lv.user?.email || em,
          fullName: lv.user?.firstName ? `${lv.user.firstName} ${lv.user.lastName || ""}` : "",
          employeeId: null,
          phone: lv.user?.phone || "",
          address: "",
          gender: "",
          hireDate: "",
          salary: 0,
          fullDay: 0,
          halfDay: 0,
          absent: 0,
          leaveDays: days
        });
      } else {
        const target = map.get(em);
        target.leaveDays += days;
      }
    });

    // finalize
    setSummary(Array.from(map.values()).sort((a,b) => (a.displayEmail || a.email).localeCompare(b.displayEmail || b.email)));
  }

  // Save salary: call PUT /api/employees/{employeeId} if we have id, otherwise fallback to updating by email (not recommended)
  async function saveSalaryFor(row) {
    const parsed = Number(newSalary);
    if (Number.isNaN(parsed) || parsed < 0) {
      toast.error("Enter valid non-negative salary");
      return;
    }

    // need employeeId to update via EmployeeController PUT /api/employees/{id}
    if (row.employeeId) {
      // Build a safe payload including current employee fields — keep user null so controller preserves existing user
      // We'll request the employee record from employees array
      const emp = employees.find(e => normalizeEmailFromEntity(e) === row.email);
      if (!emp) {
        toast.error("Employee record not found for update");
        return;
      }

      // Compose payload: include employee fields; EmployeeController will preserve user relation
      const payload = {
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        address: emp.address || null,
        address2: emp.address2 || null,
        department: emp.department || null,
        position: emp.position || null,
        phone: emp.phone || null,
        salary: parsed,
        gender: emp.gender || null,
        hireDate: emp.hireDate || null
      };

      try {
        const res = await axios.put(`${EMP_API}/${emp.employeeId}`, payload, { headers: { "Content-Type": "application/json" } });
        toast.success("Salary updated");
        // update local state
        setEmployees(prev => prev.map(p => p.employeeId === emp.employeeId ? ({ ...p, salary: parsed }) : p));
        setSummary(prev => prev.map(s => s.email === row.email ? ({ ...s, salary: parsed }) : s));
        setEditRowEmail(null);
        setNewSalary("");
      } catch (err) {
        console.error("Error updating salary:", err);
        toast.error("Failed to update salary on server");
      }
    } else {
      // No employeeId: fallback to server endpoint that updates by email (if implemented)
      try {
        // If your backend exposes a by-email update, adjust endpoint accordingly.
        // This example tries to PUT to /api/employees (not ideal). Replace if you have another endpoint.
        await axios.put(`${EMP_API}`, { email: row.email, salary: parsed });
        toast.success("Salary (by email) updated");
        setSummary(prev => prev.map(s => s.email === row.email ? ({ ...s, salary: parsed }) : s));
        setEditRowEmail(null);
        setNewSalary("");
      } catch (err) {
        console.error("Fallback salary update failed:", err);
        toast.error("Failed to update salary (no employeeId available)");
      }
    }
  }

  function getMonthYearForEmail(email) {
    const d = selectedDates[email] || {};
    return { month: (typeof d.month === "number" ? d.month : new Date().getMonth()), year: (d.year || new Date().getFullYear()) };
  }

  function handleDownloadPayslip(row) {
    const { month, year } = getMonthYearForEmail(row.email);

    const empRecord = employees.find(e => normalizeEmailFromEntity(e) === row.email);
    const employee = empRecord || { user: { email: row.displayEmail || row.email }, firstName: row.fullName || "", phone: row.phone || "", address: row.address || "" };

    const empAttendance = attendance.filter(a => {
      const em = (a.email || a.user?.email || "").toString().trim().toLowerCase();
      if (em !== row.email) return false;
      const d = parseDateSafe(a.date || a.attendanceDate || a.createdAt);
      if (!d) return false;
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const empLeave = leave.filter(l => {
      const em = (l.email || l.user?.email || "").toString().trim().toLowerCase();
      if (em !== row.email) return false;

      // determine if leave intersects month
      const start = parseDateSafe(l.startDate || l.date);
      const end = parseDateSafe(l.endDate || l.date);
      if (!start || !end) return false;
      return (start.getFullYear() === year && start.getMonth() === month) || (end.getFullYear() === year && end.getMonth() === month) ||
        (start < new Date(year, month + 1, 1) && end >= new Date(year, month, 1));
    });

    const fullDay = empAttendance.filter(a => {
      const s = (a.status || a.attendance || "").toString().toLowerCase();
      return s.includes("full");
    }).length;

    const halfDay = empAttendance.filter(a => {
      const s = (a.status || a.attendance || "").toString().toLowerCase();
      return s.includes("half");
    }).length;

    // sum leave days within month (approx)
    let leaveCount = 0;
    empLeave.forEach(l => {
      if (l.days) leaveCount += Number(l.days);
      else if (l.startDate && l.endDate) {
        // clamp range to month
        const s = parseDateSafe(l.startDate);
        const e = parseDateSafe(l.endDate);
        if (!s || !e) return;
        const startClamp = s < new Date(year, month, 1) ? new Date(year, month, 1) : s;
        const endClamp = e > new Date(year, month + 1, 0) ? new Date(year, month + 1, 0) : e;
        leaveCount += daysBetweenInclusive(startClamp, endClamp);
      } else {
        leaveCount += 1;
      }
    });

    // payroll calculation (sample): full day 500, half 250, leave 0 or paid as per rules
    const fullDaySalary = fullDay * 500;
    const halfDaySalary = halfDay * 250;
    const leaveSalary = leaveCount * 0; // adapt if leaves are paid/deducted
    const total = fullDaySalary + halfDaySalary + leaveSalary;

    // generate PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Salary Receipt", 14, 20);

    doc.setFontSize(11);
    doc.text(`Employee: ${employee.user?.email || employee.email || row.displayEmail || row.email}`, 14, 36);
    doc.text(`Name: ${employee.firstName || row.fullName || ""}`, 14, 44);
    doc.text(`Month: ${months[month]} ${year}`, 14, 52);

    doc.text(`Full days: ${fullDay} x 500 = ${fullDaySalary}`, 14, 72);
    doc.text(`Half days: ${halfDay} x 250 = ${halfDaySalary}`, 14, 80);
    doc.text(`Leaves: ${leaveCount} x 0 = ${leaveSalary}`, 14, 88);

    doc.setFontSize(13);
    doc.text(`Net Pay: ${total}`, 14, 108);

    doc.save(`payslip_${(employee.user?.email || row.email).replace(/[@.]/g, "_")}_${months[month]}_${year}.pdf`);
    toast.success("Payslip generated");
  }

  const filteredSummary = summary.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.email || "").toLowerCase().includes(q) ||
           (s.fullName || "").toLowerCase().includes(q) ||
           (s.displayEmail || "").toLowerCase().includes(q);
  });

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: "#007bff", textAlign: "center" }}>Attendance Summary Report</h2>

      <div style={{ maxWidth: 1200, margin: "20px auto 8px", display: "flex", gap: 12, alignItems: "center" }}>
        <input placeholder="Search by email or name" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 8 }} />
        <button onClick={loadAll} style={{ padding: "8px 12px", background: "#007bff", color: "#fff", border: "none", borderRadius: 6 }}>Refresh</button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", background: "#fff", borderRadius: 8, padding: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
        {loading ? <div>Loading...</div> : <div style={{ marginBottom: 8, color: "#555" }}>{filteredSummary.length} record(s)</div>}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#007bff", color: "#fff" }}>
                <th style={th}>Email</th>
                <th style={th}>Full Day</th>
                <th style={th}>Half Day</th>
                <th style={th}>Absent</th>
                <th style={th}>Leaves</th>
                <th style={th}>Total Days</th>
                <th style={th}>Salary</th>
                <th style={th}>Change Salary</th>
                <th style={th}>Pay Slip</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummary.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 20, textAlign: "center" }}>No records found</td></tr>
              )}
              {filteredSummary.map((row, idx) => {
                const { month, year } = getMonthYearForEmail(row.email);
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={td}>{row.displayEmail || row.email}</td>
                    <td style={td}>{row.fullDay}</td>
                    <td style={td}>{row.halfDay}</td>
                    <td style={td}>{row.absent}</td>
                    <td style={td}>{row.leaveDays}</td>
                    <td style={td}>{row.fullDay + row.halfDay + row.absent + row.leaveDays}</td>
                    <td style={td}>
                      {editRowEmail === row.email ? (
                        <input type="number" value={newSalary} onChange={e => setNewSalary(e.target.value)} style={{ width: 110 }} />
                      ) : (
                        row.salary ?? 0
                      )}
                    </td>
                    <td style={td}>
                      {editRowEmail === row.email ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => saveSalaryFor(row)} style={okBtn}>Save</button>
                          <button onClick={() => { setEditRowEmail(null); setNewSalary(""); }} style={cancelBtn}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditRowEmail(row.email); setNewSalary(String(row.salary ?? 0)); }} style={changeBtn}>Change</button>
                      )}
                    </td>
                    <td style={td}>
                      <select value={month} onChange={e => setSelectedDates(prev => ({ ...prev, [row.email]: { ...(prev[row.email]||{}), month: Number(e.target.value), year } }))}>
                        {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                      </select>
                      <input type="number" value={year} onChange={e => setSelectedDates(prev => ({ ...prev, [row.email]: { ...(prev[row.email]||{}), month, year: Number(e.target.value) } }))} style={{ width: 80, marginLeft: 6 }} />
                      <button onClick={() => handleDownloadPayslip(row)} style={{ marginLeft: 6, padding: "6px 8px", background: "#007bff", color: "#fff", border: "none", borderRadius: 6 }}>Download</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const th = { padding: "10px 12px", textAlign: "left" };
const td = { padding: "10px 12px", verticalAlign: "middle" };
const changeBtn = { background: "#28a745", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6 };
const okBtn = { background: "#007bff", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6 };
const cancelBtn = { background: "#777", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6 };

export default Salary;
