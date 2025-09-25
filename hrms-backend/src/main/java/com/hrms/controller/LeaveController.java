package com.hrms.controller;

import com.hrms.dao.LeaveRepository;
import com.hrms.dao.UserRepository;
import com.hrms.entity.Leave;
import com.hrms.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.*;

/**
 * LeaveController - simplified reject flow (Yes/No only).
 */
@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class LeaveController {

    private final LeaveRepository leaveRepo;
    private final UserRepository userRepo;

    public LeaveController(LeaveRepository leaveRepo, UserRepository userRepo) {
        this.leaveRepo = leaveRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("")
    public ResponseEntity<?> listAll() {
        try {
            List<Leave> list = leaveRepo.findAll();
            // hide password hash on user object before returning
            list.forEach(l -> { if (l.getUser() != null) l.getUser().setPasswordHash(null); });
            return ResponseEntity.ok(list);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error fetching leaves"));
        }
    }

    @PostMapping("")
    public ResponseEntity<?> applyLeave(@RequestBody Map<String, Object> body) {
        try {
            String email = Optional.ofNullable(body.get("email")).map(Object::toString).map(String::trim).orElse(null);
            String dateStr = Optional.ofNullable(body.get("date")).map(Object::toString).orElse(null);
            String reason = Optional.ofNullable(body.get("reason")).map(Object::toString).orElse("");

            if (email == null || dateStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "email and date are required"));
            }

            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User with that email not found"));

            Leave leave = Leave.builder()
                    .user(user)
                    .startDate(LocalDate.parse(dateStr))
                    .endDate(LocalDate.parse(dateStr))
                    .status(Leave.Status.PENDING)
                    .reason(reason.trim())
                    .rejectReason(null)
                    .build();

            Leave saved = leaveRepo.save(leave);
            if (saved.getUser() != null) saved.getUser().setPasswordHash(null);
            return ResponseEntity.created(URI.create("/api/leave/" + saved.getLeaveId())).body(saved);

        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of("error", iae.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error creating leave"));
        }
    }

    /**
     * Approve/reject using only response = "Yes" or "No".
     * Example payloads:
     *   { "response": "Yes" }
     *   { "response": "No" }
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> respond(@PathVariable("id") Integer id, @RequestBody Map<String, Object> body) {
        try {
            String response = Optional.ofNullable(body.get("response")).map(Object::toString).orElse(null);
            if (response == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "response is required (Yes|No)"));
            }

            Optional<Leave> opt = leaveRepo.findById(id);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Leave not found for id: " + id));
            }

            Leave existing = opt.get();

            if ("Yes".equalsIgnoreCase(response)) {
                existing.setStatus(Leave.Status.APPROVED);
                existing.setRejectReason(null);
            } else if ("No".equalsIgnoreCase(response)) {
                existing.setStatus(Leave.Status.REJECTED);
                // clear any previous rejectReason — we do not record HR reason
                existing.setRejectReason(null);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Unknown response value: " + response));
            }

            Leave saved = leaveRepo.save(existing);
            if (saved.getUser() != null) saved.getUser().setPasswordHash(null);
            return ResponseEntity.ok(saved);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error handling response"));
        }
    }
}
