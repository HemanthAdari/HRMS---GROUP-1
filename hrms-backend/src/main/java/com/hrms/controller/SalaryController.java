package com.hrms.controller;

import com.hrms.entity.Salary;
import com.hrms.service.SalaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salaries")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SalaryController {

    private final SalaryService salaryService;

    public SalaryController(SalaryService salaryService) {
        this.salaryService = salaryService;
    }

    // GET /api/salaries
    @GetMapping
    public ResponseEntity<List<Salary>> getAll() {
        return ResponseEntity.ok(salaryService.findAll());
    }

    // GET /api/salaries/employee/{id}
    @GetMapping("/employee/{id}")
    public ResponseEntity<List<Salary>> getByEmployee(@PathVariable Integer id) {
        return ResponseEntity.ok(salaryService.findByEmployeeId(id));
    }

    /**
     * Create salary for an employee.
     * Expect JSON:
     * {
     *   "amount": 15000.0,
     *   "paymentDate": "2025-09-17",
     *   "remarks": "September payout",
     *   "employeeId": 5
     * }
     */
    @PostMapping
    public ResponseEntity<?> createSalary(@RequestBody Map<String, Object> body) {
        try {
            Double amount = body.get("amount") == null ? null : Double.valueOf(body.get("amount").toString());
            String paymentDate = (String) body.get("paymentDate");
            String remarks = body.get("remarks") == null ? null : body.get("remarks").toString();
            Integer employeeId = body.get("employeeId") == null ? null : Integer.valueOf(body.get("employeeId").toString());

            if (employeeId == null || amount == null || paymentDate == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "employeeId, amount and paymentDate are required"));
            }

            Salary s = new Salary();
            s.setAmount(amount);
            s.setPaymentDate(java.time.LocalDate.parse(paymentDate));
            s.setRemarks(remarks);

            Salary saved = salaryService.saveForEmployee(employeeId, s);

            // return salary details + employee info
            return ResponseEntity.ok(Map.of(
                    "salaryId", saved.getSalaryId(),
                    "amount", saved.getAmount(),
                    "paymentDate", saved.getPaymentDate(),
                    "remarks", saved.getRemarks(),
                    "employeeId", saved.getEmployee().getEmployeeId(),
                    "employeeName", saved.getEmployee().getFirstName() + " " + saved.getEmployee().getLastName()
            ));
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of("error", iae.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }
}
