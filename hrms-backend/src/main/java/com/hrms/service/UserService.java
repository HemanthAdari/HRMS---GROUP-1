package com.hrms.service;

import com.hrms.dao.AdminRepository;
import com.hrms.dao.EmployeeRepository;
import com.hrms.dao.HrManagerRepository;
import com.hrms.dao.UserRepository;
import com.hrms.entity.Admin;
import com.hrms.entity.HrManager;
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

    // repositories for creating role rows
    private final EmployeeRepository employeeRepository;
    private final AdminRepository adminRepository;
    private final HrManagerRepository hrManagerRepository;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       EmployeeRepository employeeRepository,
                       AdminRepository adminRepository,
                       HrManagerRepository hrManagerRepository) {
        this.userRepository = Objects.requireNonNull(userRepository, "userRepository");
        this.passwordEncoder = Objects.requireNonNull(passwordEncoder, "passwordEncoder");
        this.employeeRepository = Objects.requireNonNull(employeeRepository, "employeeRepository");
        this.adminRepository = Objects.requireNonNull(adminRepository, "adminRepository");
        this.hrManagerRepository = Objects.requireNonNull(hrManagerRepository, "hrManagerRepository");
    }

    /**
     * Register a new user.
     * Employees: saved only in users table with status=PENDING.
     * HR and Admin: also create their specific rows.
     */
    public User register(User user) {
        if (user == null) throw new IllegalArgumentException("User cannot be null");

        String email = user.getEmail();
        String rawPassword = user.getPasswordHash(); // raw password passed in here

        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }

        email = email.trim().toLowerCase();
        user.setEmail(email);

        // prevent duplicates
        userRepository.findByEmail(email).ifPresent(u -> {
            throw new IllegalArgumentException("Email already registered");
        });

        // hash password
        String hashed = passwordEncoder.encode(rawPassword);
        user.setPasswordHash(hashed);

        try {
            User saved = userRepository.save(user);

            // Only create extra role tables for Admin and HR
            try {
                if (saved.getRole() != null) {
                    switch (saved.getRole()) {
                        case ADMIN:
                            Admin admin = new Admin();
                            admin.setUser(saved);
                            if (saved.getFirstName() != null) admin.setFirstName(saved.getFirstName());
                            if (saved.getLastName() != null) admin.setLastName(saved.getLastName());
                            admin.setAccessLevel(Admin.AccessLevel.system_admin);
                            adminRepository.save(admin);
                            break;

                        case HR_MANAGER:
                            HrManager hr = new HrManager();
                            hr.setUser(saved);
                            if (saved.getFirstName() != null) hr.setFirstName(saved.getFirstName());
                            if (saved.getLastName() != null) hr.setLastName(saved.getLastName());
                            hrManagerRepository.save(hr);
                            break;

                        // EMPLOYEE -> do nothing here. Wait until HR approves.
                        default:
                            break;
                    }
                }
            } catch (Exception roleEx) {
                LOG.log(Level.WARNING, "Failed to create role record for user: " + saved.getEmail(), roleEx);
            }

            return saved;
        } catch (DataIntegrityViolationException dive) {
            LOG.log(Level.WARNING, "Data integrity violation when saving user: " + email, dive);
            throw new IllegalArgumentException("Email already registered");
        } catch (Exception ex) {
            LOG.log(Level.SEVERE, "Unexpected error while saving user: " + email, ex);
            throw ex;
        }
    }

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
        if (user == null) throw new IllegalArgumentException("User cannot be null");
        return userRepository.save(user);
    }

    public void deleteById(Integer id) {
        userRepository.deleteById(id);
    }
}
