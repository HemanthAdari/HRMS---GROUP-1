package com.hrms.controller;

import com.hrms.entity.HrManager;
import com.hrms.service.HrManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/hrmanagers")
@CrossOrigin(origins = "*")
public class HrManagerController {

    private final HrManagerService service;
    public HrManagerController(HrManagerService service) { this.service = service; }

    @GetMapping
    public List<HrManager> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<HrManager> getById(@PathVariable Integer id) {
        return service.findById(id).map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<HrManager> create(@RequestBody HrManager hr) {
        HrManager saved = service.save(hr);
        return ResponseEntity.created(URI.create("/api/hrmanagers/" + saved.getHrId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HrManager> update(@PathVariable Integer id, @RequestBody HrManager hr) {
        return service.findById(id).map(existing -> {
            hr.setHrId(id);
            return ResponseEntity.ok(service.save(hr));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
