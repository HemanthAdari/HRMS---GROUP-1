package com.hrms.service;

import com.hrms.dao.EmployeeRepository;
import com.hrms.dao.SalaryRepository;
import com.hrms.entity.Employee;
import com.hrms.entity.Salary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SalaryService {

    private final SalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;

    public SalaryService(SalaryRepository salaryRepository, EmployeeRepository employeeRepository) {
        this.salaryRepository = salaryRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Salary> findAll() {
        return salaryRepository.findAll();
    }

    public List<Salary> findByEmployeeId(Integer employeeId) {
        return salaryRepository.findByEmployeeEmployeeId(employeeId);
    }

    /**
     * Save salary and attach to employee.
     * Throws IllegalArgumentException if employee not found.
     */
    public Salary saveForEmployee(Integer employeeId, Salary salary) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for id: " + employeeId));
        salary.setEmployee(emp);
        return salaryRepository.save(salary);
    }
}
