package com.hrms.controller;

import com.hrms.entity.Admin;
import com.hrms.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService service;
    public AdminController(AdminService service) { this.service = service; }

    @GetMapping
    public List<Admin> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Admin> getById(@PathVariable Integer id) {
        return service.findById(id).map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Admin> create(@RequestBody Admin admin) {
        Admin saved = service.save(admin);
        return ResponseEntity.created(URI.create("/api/admins/" + saved.getAdminId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Admin> update(@PathVariable Integer id, @RequestBody Admin admin) {
        return service.findById(id).map(existing -> {
            admin.setAdminId(id);
            return ResponseEntity.ok(service.save(admin));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
