package com.hrms.dao;

import com.hrms.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SalaryRepository extends JpaRepository<Salary, Integer> {
    // Find salaries for a given employee id
    List<Salary> findByEmployeeEmployeeId(Integer employeeId);
}
