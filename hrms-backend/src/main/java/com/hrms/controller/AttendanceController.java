package com.hrms.controller;

import com.hrms.dao.UserRepository;
import com.hrms.entity.Attendance;
import com.hrms.entity.User;
import com.hrms.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    public AttendanceController(AttendanceService attendanceService, UserRepository userRepository) {
        this.attendanceService = attendanceService;
        this.userRepository = userRepository;
    }

    /**
     * Primary GET:
     * - GET /api/attendance            -> all attendance
     * - GET /api/attendance?userId=42  -> attendance for userId 42
     */
    @GetMapping("")
    public ResponseEntity<?> getAttendance(@RequestParam(required = false) Integer userId) {
        try {
            List<Attendance> list;
            if (userId != null) {
                list = attendanceService.getAttendanceForUser(userId);
            } else {
                list = attendanceService.getAllAttendance();
            }
            // hide passwordHash before sending
            list.forEach(a -> { if (a.getUser() != null) a.getUser().setPasswordHash(null); });
            return ResponseEntity.ok(list);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }

    /**
     * Explicit mapping for frontend requests that use /all
     * GET /api/attendance/all
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

    /**
     * Explicit mapping for getting attendance by user id path
     * GET /api/attendance/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAttendanceForUserPath(@PathVariable Integer userId) {
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
     * Mark attendance
     * Accepts POST to /api/attendance and /api/attendance/mark
     */
    @PostMapping(path = {"", "/mark"})
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> body) {
        try {
            Object dateObj = body.get("date");
            if (dateObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "date is required"));
            }
            LocalDate date = LocalDate.parse(dateObj.toString());

            // determine userId
            Integer userId = null;
            if (body.containsKey("userId")) {
                Object u = body.get("userId");
                if (u != null) {
                    try {
                        userId = (u instanceof Number) ? ((Number) u).intValue() : Integer.valueOf(u.toString());
                    } catch (NumberFormatException ignored) { }
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

            // parse status
            String statusRaw = null;
            if (body.containsKey("status") && body.get("status") != null) {
                statusRaw = body.get("status").toString();
            } else if (body.containsKey("attendance") && body.get("attendance") != null) {
                statusRaw = body.get("attendance").toString();
            }

            if (statusRaw == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "status/attendance is required"));
            }

            Attendance.Status status = parseStatus(statusRaw);
            if (status == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "unknown status: " + statusRaw));
            }

            Attendance saved = attendanceService.markAttendance(userId, date, status);

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

        try {
            return Attendance.Status.valueOf(s);
        } catch (IllegalArgumentException ignored) { }

        s = s.replace('-', '_').replace(' ', '_');
        if (s.contains("FULL")) return Attendance.Status.FULL_DAY;
        if (s.contains("HALF")) return Attendance.Status.HALF_DAY;
        if (s.contains("ABSENT")) return Attendance.Status.ABSENT;
        return null;
    }
}
