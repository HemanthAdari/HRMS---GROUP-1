package com.hrms.service;

import com.hrms.dao.UserRepository;
import com.hrms.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;  // injected from SecurityConfig

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Register a new user (throws IllegalArgumentException on duplicate email)
    public User register(User user) {
        userRepository.findByEmail(user.getEmail())
                .ifPresent(u -> { throw new IllegalArgumentException("Email already registered"); });

        // hash the raw password before saving
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return userRepository.save(user);
    }

    // Authenticate: return the user if password matches
    public Optional<User> authenticate(String email, String rawPassword) {
        return userRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(rawPassword, u.getPasswordHash()));
    }

    public Optional<User> findById(Integer id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User update(User user) {
        // caller should ensure userId exists; this will perform an update if id present
        return userRepository.save(user);
    }

    public void deleteById(Integer id) {
        userRepository.deleteById(id);
    }
}
