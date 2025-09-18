package com.hrms.controller;

import com.hrms.entity.Attendance;
import com.hrms.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * Mark attendance
     * Example JSON:
     * { "userId": 1, "date": "2025-09-17", "status": "FULL_DAY" }
     */
    @PostMapping("/mark")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, String> body) {
        try {
            Integer userId = Integer.valueOf(body.get("userId"));
            LocalDate date = LocalDate.parse(body.get("date"));
            Attendance.Status status = Attendance.Status.valueOf(body.get("status"));

            Attendance saved = attendanceService.markAttendance(userId, date, status);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of("error", iae.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }

    /**
     * Get all attendance for a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAttendanceForUser(@PathVariable Integer userId) {
        try {
            List<Attendance> list = attendanceService.getAttendanceForUser(userId);
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
            return ResponseEntity.ok(list);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }
}
