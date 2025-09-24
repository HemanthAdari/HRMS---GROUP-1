package com.hrms.dao;

import com.hrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    // Find users by role and status (e.g. role = "EMPLOYEE", status = User.Status.PENDING)
    List<User> findByRoleAndStatus(User.Role role, User.Status status);

    // JpaRepository already provides findById; keeping optional override is harmless
    Optional<User> findById(Integer id);
}
