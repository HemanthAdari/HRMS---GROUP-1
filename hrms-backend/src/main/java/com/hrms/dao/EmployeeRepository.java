package com.hrms.dao;

import com.hrms.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    // email is on the associated User (employee.user.email) -> use property path user.email
    Optional<Employee> findByUserEmail(String email);
}
