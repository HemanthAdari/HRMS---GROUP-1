package com.hrms.service;

import com.hrms.dto.LoginRequest;
import com.hrms.dto.RegistrationRequest;
import com.hrms.entity.User;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Small adapter service used by AuthController.
 * Delegates to UserService for authenticate/register operations.
 */
@Service
public class AuthService {

    private final UserService userService;

    public AuthService(UserService userService) {
        this.userService = userService;
    }

    /**
     * Authenticate using LoginRequest DTO.
     * Returns Optional<User> if successful.
     */
    public Optional<User> login(LoginRequest req) {
        if (req == null || req.getEmail() == null || req.getPassword() == null) {
            return Optional.empty();
        }
        return userService.authenticate(req.getEmail(), req.getPassword());
    }

    /**
     * Register from RegistrationRequest DTO.
     * Delegates to userService.register after mapping DTO -> User entity.
     * Throws IllegalArgumentException on validation/duplicate email (userService handles that).
     */
    public User register(RegistrationRequest req) {
        if (req == null) throw new IllegalArgumentException("Missing registration data");

        User u = new User();
        u.setEmail(req.getEmail());
        // controller/service expects raw password in passwordHash and userService will hash it
        u.setPasswordHash(req.getPassword());

        // Map first/last name if provided
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());

        // Map role safely (accept case-insensitive role strings like "ADMIN" or "admin")
        if (req.getRole() != null && !req.getRole().trim().isEmpty()) {
            String r = req.getRole().trim();
            try {
                u.setRole(User.Role.valueOf(r));
            } catch (IllegalArgumentException ex1) {
                try {
                    u.setRole(User.Role.valueOf(r.toUpperCase()));
                } catch (IllegalArgumentException ex2) {
                    // fallback default role
                    u.setRole(User.Role.EMPLOYEE);
                }
            }
        } else {
            u.setRole(User.Role.EMPLOYEE);
        }

        return userService.register(u);
    }
}
