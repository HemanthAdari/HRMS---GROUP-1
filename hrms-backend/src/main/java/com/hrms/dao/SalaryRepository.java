package com.hrms.dao;

import com.hrms.entity.Salary;
import com.hrms.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for Salary rows. The salaries table links to employees via employee_id.
 */
public interface SalaryRepository extends JpaRepository<Salary, Integer> {
    // find salaries for a given Employee entity
    List<Salary> findByEmployee(Employee employee);

    // convenience: find by employee id directly
    List<Salary> findByEmployeeEmployeeId(Integer employeeId);
}
