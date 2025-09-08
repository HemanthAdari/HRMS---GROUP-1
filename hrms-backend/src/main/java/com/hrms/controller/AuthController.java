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
            user.setPasswordHash(req.getPassword()); // raw password; UserService will hash
            // role must match enum values: "employee", "hr_manager", "admin"
            user.setRole(User.Role.valueOf(req.getRole()));

            User created = userService.register(user);

            // safe response (no password)
            Map<String, Object> resp = Map.of(
                "userId", created.getUserId(),
                "email", created.getEmail(),
                "role", created.getRole(),
                "createdAt", created.getCreatedAt()
            );

            return ResponseEntity.created(URI.create("/auth/api/users/" + created.getUserId())).body(resp);

        } catch (IllegalArgumentException ex) {
            // thrown by register when duplicate email or invalid role
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
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
            user.setRole(User.Role.valueOf(req.getRole()));
            // optional: set first/last name in a related table later

            userService.register(user);
            ra.addFlashAttribute("msg", "Registration successful. Please login.");
            return "redirect:/login.html";
        } catch (IllegalArgumentException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
            return "redirect:/register.html";
        } catch (Exception ex) {
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
            Map<String, Object> payload = Map.of(
                "userId", u.getUserId(),
                "email", u.getEmail(),
                "role", u.getRole()
            );
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
