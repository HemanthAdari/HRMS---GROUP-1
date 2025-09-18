package com.hrms.dao;

import com.hrms.entity.Attendance;
import com.hrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    // find attendance rows for a given User entity
    List<Attendance> findByUser(User user);

    // convenience: find by user id directly
    List<Attendance> findByUserUserId(Integer userId);
}
