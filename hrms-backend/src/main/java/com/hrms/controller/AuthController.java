package com.hrms.controller;

import com.hrms.dto.LoginRequest;
import com.hrms.dto.RegistrationRequest;
import com.hrms.entity.User;
import com.hrms.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpSession;
import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Authentication endpoints (login / register).
 *
 * Important changes made:
 * - Registration now forces Role.EMPLOYEE and Status.PENDING (ignores any role sent from client).
 * - Registration blocks self-registration for reserved admin/hr emails.
 * - Safe JSON responses avoid returning password hashes.
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    private final UserService userService;

    // TODO: replace these with your actual admin/hr addresses or fetch from config
    private static final String RESERVED_ADMIN_EMAIL = "admin@yourdomain.com";
    private static final String RESERVED_HR_EMAIL    = "hr@yourdomain.com";

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // -----------------------
    // JSON / AJAX registration
    // -----------------------
    @PostMapping(path = "/api/register", consumes = "application/json")
    public ResponseEntity<?> registerJson(@RequestBody RegistrationRequest req) {
        try {
            String email = (req.getEmail() == null ? "" : req.getEmail().trim()).toLowerCase();
            String rawPassword = req.getPassword() == null ? "" : req.getPassword();

            if (email.isEmpty() || rawPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }

            // block admin/hr reserved emails from self-registering
            if (RESERVED_ADMIN_EMAIL.equalsIgnoreCase(email) || RESERVED_HR_EMAIL.equalsIgnoreCase(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Registration with this email is not allowed"));
            }

            // map DTO -> entity (server controls role/status)
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(rawPassword); // raw; UserService.register should handle hashing
            user.setFirstName(req.getFirstName());
            user.setLastName(req.getLastName());
            // Force employee role and pending status regardless of client input
            user.setRole(User.Role.EMPLOYEE);
            user.setStatus(User.Status.PENDING);
            user.setCreatedAt(Instant.now());

            User created = userService.register(user);

            // don't return password hash
            created.setPasswordHash(null);

            Map<String, Object> resp = new HashMap<>();
            resp.put("userId", created.getUserId());
            resp.put("email", created.getEmail());
            resp.put("role", created.getRole() != null ? created.getRole().name() : null);
            resp.put("status", created.getStatus() != null ? created.getStatus().name() : null);
            resp.put("createdAt", created.getCreatedAt() != null ? created.getCreatedAt().toString() : Instant.now().toString());

            return ResponseEntity.created(URI.create("/auth/api/users/" + created.getUserId())).body(resp);

        } catch (IllegalArgumentException ex) {
            // userService.register may throw this for duplicate email etc.
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }

    // -----------------------
    // HTML FORM registration
    // -----------------------
    // Expecting form fields: email, password, firstName, lastName (role removed from form handling)
    @PostMapping(path = "/register", consumes = "application/x-www-form-urlencoded")
    public String registerForm(RegistrationRequest req, RedirectAttributes ra) {
        try {
            String email = (req.getEmail() == null ? "" : req.getEmail().trim()).toLowerCase();
            String rawPassword = req.getPassword() == null ? "" : req.getPassword();

            if (email.isEmpty() || rawPassword.isEmpty()) {
                ra.addFlashAttribute("error", "Email and password are required");
                return "redirect:/register.html";
            }

            if (RESERVED_ADMIN_EMAIL.equalsIgnoreCase(email) || RESERVED_HR_EMAIL.equalsIgnoreCase(email)) {
                ra.addFlashAttribute("error", "Registration with this email is not allowed");
                return "redirect:/register.html";
            }

            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(rawPassword);
            user.setFirstName(req.getFirstName());
            user.setLastName(req.getLastName());
            user.setRole(User.Role.EMPLOYEE);      // force
            user.setStatus(User.Status.PENDING);   // must be approved by HR
            user.setCreatedAt(Instant.now());

            userService.register(user);
            ra.addFlashAttribute("msg", "Registration successful. Please wait for HR approval.");
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
            if (u.getStatus() != null) payload.put("status", u.getStatus().name());
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
