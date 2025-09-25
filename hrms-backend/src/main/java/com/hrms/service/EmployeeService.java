package com.hrms.service;

import com.hrms.dao.EmployeeRepository;
import com.hrms.entity.Employee;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository repo;

    public EmployeeService(EmployeeRepository repo) {
        this.repo = repo;
    }

    public List<Employee> findAll() {
        // return entities as-is — do NOT mutate the nested User object here.
        // Password hiding is handled by the User entity @JsonIgnore on the getter.
        return repo.findAll();
    }

    public Optional<Employee> findById(Integer id) {
        // same: do not mutate managed User instances
        return repo.findById(id);
    }

    public Employee save(Employee e) {
        // don't touch user passwordHash here; other logic manages user.
        return repo.save(e);
    }

    public void deleteById(Integer id) {
        repo.deleteById(id);
    }

    /**
     * Find employee by associated user's email and update the numeric leaves value.
     * Returns Optional.empty() if no employee found.
     */
    public Optional<Employee> updateLeavesByEmail(String email, int leaves) {
        return repo.findByUserEmail(email.toLowerCase().trim())
                .map(emp -> {
                    emp.setLeaves(leaves);
                    return repo.save(emp);
                });
    }
}
