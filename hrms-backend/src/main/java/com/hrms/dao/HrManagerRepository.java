package com.hrms.dao;

import com.hrms.entity.HrManager;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HrManagerRepository extends JpaRepository<HrManager, Integer> {
}
