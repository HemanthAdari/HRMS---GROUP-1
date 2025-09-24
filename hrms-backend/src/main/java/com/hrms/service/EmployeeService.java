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

    public Employee save(Employee e) {
        return repo.save(e);
    }

    public List<Employee> findAll() {
        return repo.findAll();
    }

    public Optional<Employee> findById(Integer id) {
        return repo.findById(id);
    }

    public void deleteById(Integer id) {
        repo.deleteById(id);
    }

    // NEW: find employee by the user's email
    public Optional<Employee> findByUserEmail(String email) {
        return repo.findByUserEmail(email);
    }
}
