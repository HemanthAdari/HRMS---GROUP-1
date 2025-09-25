// src/components/RequestLeave.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './Menu.css';

const API = 'http://localhost:8080/api/leave';
const EMP_LEAV_API = 'http://localhost:8080/api/employees/t-leaves';

/**
 * Normalize many possible backend shapes into one stable object structure.
 */
function normalizeLeave(raw, index) {
  const originalId = raw.leaveId ?? raw.leave_id ?? raw.id ?? null;
  const srNo = raw.srNo ?? raw.sr_no ?? (originalId ? originalId : index + 1);
  const email = raw.email ?? raw.user?.email ?? raw.userEmail ?? '';
  const dateStr = raw.date ?? raw.startDate ?? raw.start_date ?? '';
  const date = dateStr ? dateStr.toString().slice(0, 10) : '';
  let response = raw.response ?? null;
  if (!response && raw.status) {
    const s = String(raw.status).toUpperCase();
    if (s === 'APPROVED') response = 'Yes';
    else if (s === 'REJECTED') response = 'No';
    else response = null;
  }
  const submittedReason = raw.reason ?? raw.leaveReason ?? raw.remarks ?? '';

  return {
    originalId,
    srNo,
    email,
    date,
    response,
    submittedReason,
    raw
  };
}

const RequestLeave = () => {
  const [leave, setLeave] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = () => {
    axios.get(API)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        const norm = arr.map((r, i) => normalizeLeave(r, i));
        setLeave(norm);
        console.debug('Loaded leave rows:', norm.length);
      })
      .catch(err => {
        console.error('Failed to load leaves', err);
        toast.error('Unable to load leave requests');
      });
  };

  // Update employee approved leave counts in employees table (legacy flow)
  useEffect(() => {
    if (leave.length === 0) return;
    const uniqueEmails = [...new Set(leave.map(lv => lv.email).filter(Boolean))];
    const approvedCounts = {};
    leave.forEach(lv => {
      if (lv.response && lv.response.toLowerCase() === 'yes') {
        approvedCounts[lv.email] = (approvedCounts[lv.email] || 0) + 1;
      }
    });
    uniqueEmails.forEach(email => {
      const count = approvedCounts[email] || 0;
      axios.put(EMP_LEAV_API, { email, leaves: count })
        .then(() => console.debug(`Updated ${email} -> ${count}`))
        .catch(err => console.error('Error updating employee leaves:', err));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leave]);

  /**
   * handleResponse
   * - Finds normalized item, extracts canonical id if available
   * - Sends { response: "Yes" } or { response: "No" } to backend
   * - Falls back to PUT by srNo if no canonical id
   */
  const handleResponse = (srNo, email, response) => {
    const idx = leave.findIndex(l => String(l.srNo) === String(srNo) && (l.email || '') === (email || ''));
    if (idx === -1) {
      console.warn('leave row not found for', srNo, email);
      toast.error('Record not found');
      return;
    }

    const item = leave[idx];
    const id = item.originalId ?? item.raw?.leaveId ?? item.raw?.leave_id ?? item.raw?.id ?? null;

    // optimistic UI update
    const updated = [...leave];
    updated[idx] = { ...updated[idx], response };
    setLeave(updated);

    const payload = { response: response === 'Yes' ? 'Yes' : 'No' };

    if (!id) {
      console.warn('No leave id found; attempting fallback PUT with srNo and email');
      axios.put(`${API}/${srNo}`, { email, response: payload.response })
        .then(() => {
          toast.success('Response saved (fallback)');
          fetchLeaves();
        })
        .catch(err => {
          console.error('Fallback update failed:', err);
          toast.error('Failed to save response');
          fetchLeaves();
        });
      return;
    }

    axios.put(`${API}/${id}`, payload)
      .then(() => {
        toast.success('Response saved');
        fetchLeaves();
      })
      .catch(err => {
        console.error('Failed to save response:', err);
        toast.error(err?.response?.data?.error || 'Failed to save response');
        fetchLeaves();
      });
  };

  return (
    <div className="leave">
      <div className="secondLeave">
        <h1>LIST OF LEAVES</h1>
        <table border="1" className="leaveTable" style={{ width: '80%', margin: '0 auto' }}>
          <thead>
            <tr>
              <th>Sr no</th>
              <th>Email</th>
              <th>Leave date</th>
              <th>Submitted Reason</th>
              <th>Response</th>
              <th>Mark</th>
            </tr>
          </thead>
          <tbody>
            {leave.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No leave requests
                </td>
              </tr>
            ) : (
              leave.map((lv, i) => (
                <tr key={lv.originalId ?? i}>
                  <td>{lv.srNo}</td>
                  <td>{lv.email || ''}</td>
                  <td>{lv.date || ''}</td>

                  {/* Submitted Reason (safe fallbacks) */}
                  <td style={{ maxWidth: 360, whiteSpace: 'pre-wrap' }}>
                    {lv.submittedReason && String(lv.submittedReason).trim() !== ''
                      ? lv.submittedReason
                      : (lv.raw?.reason ?? '-')}
                  </td>

                  <td>
                    <button
                      onClick={() => handleResponse(lv.srNo, lv.email, 'Yes')}
                      className="leaveTableBtnFirst"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleResponse(lv.srNo, lv.email, 'No')}
                      className="leaveTableBtnSecond"
                      style={{ marginLeft: 8 }}
                    >
                      No
                    </button>
                  </td>

                  <td>{lv.response || ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestLeave;
