package com.hrms.service;

import com.hrms.dao.UserRepository;
import com.hrms.entity.User;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
@Transactional
public class UserService {

    private static final Logger LOG = Logger.getLogger(UserService.class.getName());

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // constructor injection (recommended)
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = Objects.requireNonNull(userRepository, "userRepository");
        this.passwordEncoder = Objects.requireNonNull(passwordEncoder, "passwordEncoder");
    }

    /**
     * Register a new user.
     * Throws IllegalArgumentException for validation / duplicate email.
     */
    public User register(User user) {
        // basic validation
        if (user == null) throw new IllegalArgumentException("User cannot be null");
        String email = user.getEmail();
        String rawPassword = user.getPasswordHash(); // controller currently sets raw password here

        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }

        // canonicalize email (optional but recommended)
        email = email.trim().toLowerCase();
        user.setEmail(email);

        // check existence first (user-friendly message)
        userRepository.findByEmail(email).ifPresent(u -> {
            throw new IllegalArgumentException("Email already registered");
        });

        // hash the raw password before saving
        String hashed = passwordEncoder.encode(rawPassword);
        user.setPasswordHash(hashed);

        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException dive) {
            // This can happen if unique constraint is violated concurrently
            LOG.log(Level.WARNING, "Data integrity violation when saving user: " + email, dive);
            throw new IllegalArgumentException("Email already registered");
        } catch (Exception ex) {
            LOG.log(Level.SEVERE, "Unexpected error while saving user: " + email, ex);
            throw ex; // let controller handle/log and return 500
        }
    }

    /**
     * Authenticate a user with email and raw password.
     * Returns Optional<User> if password matches.
     */
    public Optional<User> authenticate(String email, String rawPassword) {
        if (email == null || rawPassword == null) return Optional.empty();
        email = email.trim().toLowerCase();
        return userRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(rawPassword, u.getPasswordHash()));
    }

    public Optional<User> findById(Integer id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        return userRepository.findByEmail(email.trim().toLowerCase());
    }

    public User update(User user) {
        // basic check
        if (user == null) throw new IllegalArgumentException("User cannot be null");
        return userRepository.save(user);
    }

    public void deleteById(Integer id) {
        userRepository.deleteById(id);
    }
}
