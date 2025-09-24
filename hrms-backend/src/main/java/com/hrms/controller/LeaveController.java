package com.hrms.controller;

import com.hrms.dao.LeaveRepository;
import com.hrms.dao.UserRepository;
import com.hrms.entity.Leave;
import com.hrms.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

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

    // GET all leaves
    @GetMapping
    public List<Leave> getAll() {
        return leaveRepo.findAll();
    }

    // POST apply leave
    @PostMapping
    public ResponseEntity<?> applyLeave(@RequestBody LeaveRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Leave leave = Leave.builder()
                .user(user)
                .startDate(LocalDate.parse(req.getDate()))  // using your single-date input
                .endDate(LocalDate.parse(req.getDate()))    // same as startDate
                .status(Leave.Status.PENDING)
                .reason("N/A") // optional, can extend later
                .build();

        Leave saved = leaveRepo.save(leave);
        return ResponseEntity.created(URI.create("/api/leave/" + saved.getLeaveId())).body(saved);
    }

    // PUT update leave response (approve/reject)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLeave(@PathVariable Integer id, @RequestBody LeaveResponse req) {
        return leaveRepo.findById(id)
                .map(existing -> {
                    if ("Yes".equalsIgnoreCase(req.getResponse())) {
                        existing.setStatus(Leave.Status.APPROVED);
                    } else if ("No".equalsIgnoreCase(req.getResponse())) {
                        existing.setStatus(Leave.Status.REJECTED);
                    }
                    Leave saved = leaveRepo.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- inner DTO classes ---
    static class LeaveRequest {
        private String email;
        private String date;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }

    static class LeaveResponse {
        private String email;
        private String response;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getResponse() { return response; }
        public void setResponse(String response) { this.response = response; }
    }
}
