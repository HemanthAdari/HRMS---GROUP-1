package com.hrms.controller;

import com.hrms.dao.UserRepository;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/**
 * Controller for HR actions: view pending employee registrations and approve/reject them.
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class HrController {

    private final UserRepository userRepo;
    private final EmployeeService employeeService;

    public HrController(UserRepository userRepo, EmployeeService employeeService) {
        this.userRepo = userRepo;
        this.employeeService = employeeService;
    }

    @GetMapping("/pending-employees")
    public ResponseEntity<List<User>> listPendingEmployees() {
        List<User> pending = userRepo.findByRoleAndStatus(User.Role.EMPLOYEE, User.Status.PENDING);
        // Do NOT call user.setPasswordHash(null) here — will mutate managed entity.
        // Password will not be serialized because of @JsonIgnore on the getter.
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Integer id,
                                         @RequestBody(required = false) ApproveRequest req) {
        return userRepo.findById(id).map(user -> {
            if (user.getStatus() != User.Status.PENDING || user.getRole() != User.Role.EMPLOYEE) {
                return ResponseEntity.badRequest().body("User is not a pending employee registration");
            }

            user.setStatus(User.Status.ACTIVE);
            userRepo.save(user);

            Employee emp = Employee.builder()
                    .user(user)
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .address(req != null ? req.getAddress() : null)
                    .phone(req != null ? req.getPhone() : null)
                    .department(req != null ? req.getDepartment() : null)
                    .position(req != null ? req.getPosition() : null)
                    .salary(req != null ? req.getSalary() : null)
                    .build();

            Employee saved = employeeService.save(emp);

            return ResponseEntity.created(URI.create("/api/employees/" + saved.getEmployeeId())).body(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Integer id,
                                        @RequestBody(required = false) RejectRequest req) {
        return userRepo.findById(id).map(user -> {
            if (user.getStatus() != User.Status.PENDING) {
                return ResponseEntity.badRequest().body("User is not pending");
            }
            user.setStatus(User.Status.REJECTED);
            userRepo.save(user);
            // Do NOT mutate user.setPasswordHash(null) here (avoids managed mutation & DB update)
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    public static class ApproveRequest {
        private String address;
        private String phone;
        private String department;
        private String position;
        private Double salary;
        // getters + setters
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
        public Double getSalary() { return salary; }
        public void setSalary(Double salary) { this.salary = salary; }
    }

    public static class RejectRequest {
        private String reason;
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
