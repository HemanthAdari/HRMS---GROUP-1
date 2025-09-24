package com.hrms.controller;

import com.hrms.entity.Employee;
import com.hrms.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EmployeeController {

    private final EmployeeService service;
    public EmployeeController(EmployeeService service) { this.service = service; }

    @GetMapping
    public List<Employee> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getById(@PathVariable Integer id) {
        return service.findById(id).map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Employee> create(@RequestBody Employee emp) {
        Employee saved = service.save(emp);
        return ResponseEntity.created(URI.create("/api/employees/" + saved.getEmployeeId())).body(saved);
    }

    /**
     * Update employee by employee_id.
     * We accept a JSON payload containing the fields you want to update (partial allowed).
     * Example payload from frontend:
     * {
     *   "firstName":"John","lastName":"Doe","address":"addr1, addr2",
     *   "address2":"addr2","phone":"12345","salary":50000,
     *   "gender":"male","hireDate":"2025-09-01"
     * }
     */
    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<Employee> opt = service.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Employee existing = opt.get();

        // selectively apply updates if present to avoid overwriting unintended fields
        if (body.containsKey("firstName")) existing.setFirstName((String) body.get("firstName"));
        if (body.containsKey("lastName")) existing.setLastName((String) body.get("lastName"));
        if (body.containsKey("address")) existing.setAddress((String) body.get("address"));
        if (body.containsKey("address2")) existing.setAddress2((String) body.get("address2"));
        if (body.containsKey("phone")) existing.setPhone((String) body.get("phone"));
        if (body.containsKey("salary")) {
            Object v = body.get("salary");
            if (v instanceof Number) existing.setSalary(((Number) v).doubleValue());
            else if (v instanceof String && !((String) v).isBlank()) existing.setSalary(Double.valueOf((String) v));
            else existing.setSalary(null);
        }
        if (body.containsKey("gender")) existing.setGender((String) body.get("gender"));
        if (body.containsKey("hireDate")) {
            Object vd = body.get("hireDate");
            if (vd instanceof String && !((String) vd).isBlank()) {
                existing.setHireDate(LocalDate.parse((String) vd));
            } else {
                existing.setHireDate(null);
            }
        }

        Employee saved = service.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
