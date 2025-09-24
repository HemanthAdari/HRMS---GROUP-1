package com.hrms.controller;

import com.hrms.dto.LoginRequest;
import com.hrms.dto.RegistrationRequest;
import com.hrms.entity.User;
import com.hrms.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpSession;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // -----------------------
    // JSON / AJAX registration
    // -----------------------
    @PostMapping(path = "/api/register", consumes = "application/json")
    public ResponseEntity<?> registerJson(@RequestBody RegistrationRequest req) {
        try {
            // map DTO -> entity
            User user = new User();
            user.setEmail(req.getEmail());
            user.setPasswordHash(req.getPassword()); // raw password; will be hashed in service

            // Normalize and map role safely (accept case-insensitive input)
            String roleInput = req.getRole() == null ? "" : req.getRole().trim();
            try {
                user.setRole(User.Role.valueOf(roleInput));
            } catch (IllegalArgumentException e1) {
                try {
                    user.setRole(User.Role.valueOf(roleInput.toUpperCase()));
                } catch (IllegalArgumentException e2) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + req.getRole()));
                }
            }

            User created = userService.register(user);

            // Safe response building: avoid Map.of with possible nulls
            Map<String, Object> resp = new HashMap<>();
            resp.put("userId", created.getUserId());
            if (created.getEmail() != null) resp.put("email", created.getEmail());
            if (created.getRole() != null) resp.put("role", created.getRole().name());

            // createdAt might be null depending on entity mapping, add safely
            try {
                Object createdAt = created.getCreatedAt();
                if (createdAt != null) {
                    resp.put("createdAt", createdAt);
                } else {
                    // optional: put server time as fallback (or skip)
                    resp.put("createdAt", Instant.now().toString());
                }
            } catch (Exception ignore) {
                // ignore any createdAt access issues
            }

            return ResponseEntity.ok(resp);

        } catch (IllegalArgumentException ex) {
            // thrown by register when duplicate email or invalid role
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            // log to console for debugging during development
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }

    // -----------------------
    // HTML FORM registration
    // -----------------------
    // Expecting form fields: email, password, role, firstName, lastName (role required)
    @PostMapping(path = "/register", consumes = "application/x-www-form-urlencoded")
    public String registerForm(RegistrationRequest req, RedirectAttributes ra) {
        try {
            User user = new User();
            user.setEmail(req.getEmail());
            user.setPasswordHash(req.getPassword()); // raw -> will be hashed in service

            // role mapping with same safe strategy
            String roleInput = req.getRole() == null ? "" : req.getRole().trim();
            try {
                user.setRole(User.Role.valueOf(roleInput));
            } catch (IllegalArgumentException e1) {
                try {
                    user.setRole(User.Role.valueOf(roleInput.toUpperCase()));
                } catch (IllegalArgumentException e2) {
                    ra.addFlashAttribute("error", "Invalid role: " + req.getRole());
                    return "redirect:/register.html";
                }
            }

            userService.register(user);
            ra.addFlashAttribute("msg", "Registration successful. Please login.");
            return "redirect:/login.html";
        } catch (IllegalArgumentException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
            return "redirect:/register.html";
        } catch (Exception ex) {
            ex.printStackTrace();
            ra.addFlashAttribute("error", "Server error");
            return "redirect:/register.html";
        }
    }

    // -----------------------
    // JSON / AJAX login
    // -----------------------
    @PostMapping(path = "/api/login", consumes = "application/json")
    public ResponseEntity<?> loginJson(@RequestBody LoginRequest req, HttpSession session) {
        Optional<User> opt = userService.authenticate(req.getEmail(), req.getPassword());
        if (opt.isPresent()) {
            User u = opt.get();
            session.setAttribute("userId", u.getUserId());
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", u.getUserId());
            if (u.getEmail() != null) payload.put("email", u.getEmail());
            if (u.getRole() != null) payload.put("role", u.getRole().name());
            if (u.getStatus() != null) payload.put("status", u.getStatus().name()); // <-- added status
            return ResponseEntity.ok(payload);
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    // -----------------------
    // HTML FORM login
    // -----------------------
    // Form should post email & password to /auth/login
    @PostMapping(path = "/login", consumes = "application/x-www-form-urlencoded")
    public String loginForm(@RequestParam String email,
                            @RequestParam String password,
                            HttpSession session,
                            RedirectAttributes ra) {
        Optional<User> opt = userService.authenticate(email, password);
        if (opt.isPresent()) {
            User u = opt.get();
            session.setAttribute("userId", u.getUserId());
            return "redirect:/dashboard.html";
        } else {
            ra.addFlashAttribute("error", "Invalid credentials");
            return "redirect:/login.html";
        }
    }
}
