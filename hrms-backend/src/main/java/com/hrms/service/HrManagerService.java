package com.hrms.service;

import com.hrms.dao.HrManagerRepository;
import com.hrms.entity.HrManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class HrManagerService {

    private final HrManagerRepository repo;

    public HrManagerService(HrManagerRepository repo) {
        this.repo = repo;
    }

    public HrManager save(HrManager hr) {
        return repo.save(hr);
    }

    public List<HrManager> findAll() {
        return repo.findAll();
    }

    public Optional<HrManager> findById(Integer id) {
        return repo.findById(id);
    }

    public void deleteById(Integer id) {
        repo.deleteById(id);
    }
}
