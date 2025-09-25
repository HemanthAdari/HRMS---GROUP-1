package com.hrms.dao;

import com.hrms.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    // find employee by the associated user's email
    Optional<Employee> findByUserEmail(String email);
}
