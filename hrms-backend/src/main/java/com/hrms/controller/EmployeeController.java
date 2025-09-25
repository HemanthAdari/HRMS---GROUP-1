package com.hrms.controller;

import com.hrms.entity.Employee;
import com.hrms.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Employee REST controller.
 */
@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @GetMapping
    public List<Employee> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(emp -> ResponseEntity.ok(emp))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Employee> create(@RequestBody Employee emp) {
        Employee saved = service.save(emp);
        return ResponseEntity.created(URI.create("/api/employees/" + saved.getEmployeeId())).body(saved);
    }

    /**
     * Update only employee-specific fields; do NOT replace the linked user.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Integer id, @RequestBody Employee emp) {
        return service.findById(id).map(existing -> {
            emp.setUser(existing.getUser());
            emp.setEmployeeId(id);
            Employee saved = service.save(emp);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Accept aggregated leave counts (from HR UI).
     * Body: { "email": "user@example.com", "leaves": 3 }
     *
     * This persists the leaves value into employees.leaves when an Employee exists for that email.
     */
    @PutMapping("/t-leaves")
    public ResponseEntity<?> updateLeavesByEmail(@RequestBody Map<String, Object> body) {
        if (body == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Request body required"));
        }

        Object emailObj = body.get("email");
        Object leavesObj = body.get("leaves");

        if (emailObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email required"));
        }

        String email = emailObj.toString().trim().toLowerCase();
        int leaves = 0;
        if (leavesObj instanceof Number) {
            leaves = ((Number) leavesObj).intValue();
        } else if (leavesObj instanceof String) {
            try {
                leaves = Integer.parseInt(((String) leavesObj).trim());
            } catch (NumberFormatException ignored) {
                // keep default 0
            }
        }

        if (email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email is empty"));
        }
        if (leaves < 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "leaves must be >= 0"));
        }

        Optional<Employee> updated = service.updateLeavesByEmail(email, leaves);
        if (updated.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "employee not found for email: " + email));
        }

        // return updated employee (it will be serialized to JSON)
        return ResponseEntity.ok(updated.get());
    }
}
