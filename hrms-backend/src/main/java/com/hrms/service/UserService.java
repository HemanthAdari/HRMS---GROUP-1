package com.hrms.service;

import com.hrms.dao.AdminRepository;
import com.hrms.dao.EmployeeRepository;
import com.hrms.dao.HrManagerRepository;
import com.hrms.dao.UserRepository;
import com.hrms.entity.Admin;
import com.hrms.entity.Employee;
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

    // constructor injection (recommended)
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
            // save user
            User saved = userRepository.save(user);

            // create minimal role-specific record if not already present
            try {
                if (saved.getRole() != null) {
                    switch (saved.getRole()) {
                        case EMPLOYEE:
                            // create employee row linked to user if not exists
                            // minimal fields set — adjust if your Employee entity requires non-null fields
                            Employee emp = new Employee();
                            emp.setUser(saved);
                            // if User has name fields, copy them
                            if (saved.getFirstName() != null) emp.setFirstName(saved.getFirstName());
                            if (saved.getLastName() != null) emp.setLastName(saved.getLastName());
                            employeeRepository.save(emp);
                            break;
                        case ADMIN:
                            Admin admin = new Admin();
                            admin.setUser(saved);

                            // copy name fields if available from User
                            if (saved.getFirstName() != null) admin.setFirstName(saved.getFirstName());
                            if (saved.getLastName() != null) admin.setLastName(saved.getLastName());

                            // default access level
                            admin.setAccessLevel(Admin.AccessLevel.system_admin);

                            adminRepository.save(admin);
                            break;
                        case HR_MANAGER:
                            HrManager hr = new HrManager();
                            hr.setUser(saved);
                            // attempt to copy name fields if present
                            if (saved.getFirstName() != null) hr.setFirstName(saved.getFirstName());
                            if (saved.getLastName() != null) hr.setLastName(saved.getLastName());
                            hrManagerRepository.save(hr);
                            break;
                        default:
                            // no-op for unknown roles
                            break;
                    }
                }
            } catch (Exception roleEx) {
                // Log but do not block registration — role table creation failure should be fixed separately
                LOG.log(Level.WARNING, "Failed to create role record for user: " + saved.getEmail(), roleEx);
            }

            return saved;
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
