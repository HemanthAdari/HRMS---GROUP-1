package com.hrms.dao;

import com.hrms.entity.Leave;
import com.hrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Integer> {
    List<Leave> findByUser(User user);
}
