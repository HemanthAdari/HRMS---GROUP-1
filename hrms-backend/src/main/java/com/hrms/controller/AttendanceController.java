package com.hrms.controller;

import com.hrms.dao.UserRepository;
import com.hrms.entity.Attendance;
import com.hrms.entity.User;
import com.hrms.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    public AttendanceController(AttendanceService attendanceService, UserRepository userRepository) {
        this.attendanceService = attendanceService;
        this.userRepository = userRepository;
    }

    /**
     * GET /api/attendance
     * Return all attendance records (same as /all). Useful for admin dashboards
     * and for frontend code that expects GET /api/attendance.
     */
    @GetMapping("")
    public ResponseEntity<?> getAllRoot() {
        try {
            List<Attendance> list = attendanceService.getAllAttendance();
            // hide passwordHash
            list.forEach(a -> { if (a.getUser() != null) a.getUser().setPasswordHash(null); });
            return ResponseEntity.ok(list);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }

    /**
     * Mark attendance.
     * Accepts POST to either /api/attendance or /api/attendance/mark
     *
     * JSON accepted examples:
     * { "userId": 1, "date": "2025-09-17", "status": "FULL_DAY" }
     * { "email": "employee@example.com", "date": "2025-09-24", "attendance": "present_full_day" }
     */
    @PostMapping(path = {"/mark", ""})
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> body) {
        try {
            // parse date
            Object dateObj = body.get("date");
            if (dateObj == null) return ResponseEntity.badRequest().body(Map.of("error", "date is required"));

            LocalDate date = LocalDate.parse(dateObj.toString());

            // determine userId: prefer userId, fallback to email lookup
            Integer userId = null;
            if (body.containsKey("userId")) {
                Object u = body.get("userId");
                if (u != null) {
                    try {
                        userId = (u instanceof Number) ? ((Number) u).intValue() : Integer.valueOf(u.toString());
                    } catch (NumberFormatException ignored) { /* leave null */ }
                }
            }

            if (userId == null && body.containsKey("email")) {
                String email = body.get("email").toString().trim().toLowerCase(Locale.ROOT);
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "User with email not found"));
                }
                userId = userOpt.get().getUserId();
            }

            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId or email is required"));
            }

            // determine status: accept "status" or "attendance" and map common values
            String statusRaw = null;
            if (body.containsKey("status") && body.get("status") != null) statusRaw = body.get("status").toString();
            else if (body.containsKey("attendance") && body.get("attendance") != null) statusRaw = body.get("attendance").toString();

            if (statusRaw == null) return ResponseEntity.badRequest().body(Map.of("error", "status/attendance is required"));

            Attendance.Status status = parseStatus(statusRaw);
            if (status == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "unknown status: " + statusRaw));
            }

            Attendance saved = attendanceService.markAttendance(userId, date, status);

            // hide passwordHash before returning
            if (saved.getUser() != null) saved.getUser().setPasswordHash(null);

            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of("error", iae.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }

    private Attendance.Status parseStatus(String raw) {
        if (raw == null) return null;
        String s = raw.trim().toUpperCase(Locale.ROOT);

        // direct match to enum values
        try {
            return Attendance.Status.valueOf(s);
        } catch (IllegalArgumentException ignored) { }

        // normalize common frontend values
        s = s.replace('-', '_').replace(' ', '_');

        if (s.contains("FULL") || s.contains("PRESENT_FULL") || s.contains("PRESENTFULL") || s.contains("PRESENT_FULL_DAY")) {
            return Attendance.Status.FULL_DAY;
        }
        if (s.contains("HALF") || s.contains("PRESENT_HALF") || s.contains("PRESENT_HALF_DAY")) {
            return Attendance.Status.HALF_DAY;
        }
        if (s.contains("ABSENT") || s.contains("NOT_PRESENT")) {
            return Attendance.Status.ABSENT;
        }

        return null;
    }

    /**
     * Get all attendance for a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAttendanceForUser(@PathVariable Integer userId) {
        try {
            List<Attendance> list = attendanceService.getAttendanceForUser(userId);
            list.forEach(a -> { if (a.getUser() != null) a.getUser().setPasswordHash(null); });
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of("error", iae.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }

    /**
     * Get all attendance (for ADMIN / HR only)
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllAttendance() {
        try {
            List<Attendance> list = attendanceService.getAllAttendance();
            list.forEach(a -> { if (a.getUser() != null) a.getUser().setPasswordHash(null); });
            return ResponseEntity.ok(list);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }
}
