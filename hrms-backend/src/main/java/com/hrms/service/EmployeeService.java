package com.hrms.service;

import com.hrms.dao.EmployeeRepository;
import com.hrms.entity.Employee;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {
    private final EmployeeRepository repo;

    public EmployeeService(EmployeeRepository repo) { this.repo = repo; }

    public List<Employee> findAll() { return repo.findAll(); }

    public Optional<Employee> findById(Integer id) { return repo.findById(id); }

    public Employee save(Employee e) { return repo.save(e); }

    public void deleteById(Integer id) { repo.deleteById(id); }
}
