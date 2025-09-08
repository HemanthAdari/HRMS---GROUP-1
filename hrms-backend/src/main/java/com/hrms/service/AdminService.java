package com.hrms.service;

import com.hrms.dao.AdminRepository;
import com.hrms.entity.Admin;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AdminService {

    private final AdminRepository repo;

    public AdminService(AdminRepository repo) {
        this.repo = repo;
    }

    public Admin save(Admin admin) {
        return repo.save(admin);
    }

    public List<Admin> findAll() {
        return repo.findAll();
    }

    public Optional<Admin> findById(Integer id) {
        return repo.findById(id);
    }

    public void deleteById(Integer id) {
        repo.deleteById(id);
    }
}
