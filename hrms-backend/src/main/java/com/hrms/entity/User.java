package com.hrms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "passwordHash")
@EqualsAndHashCode(exclude = "passwordHash")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    // name fields
    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    // created_at from DB
    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;

    // status mapped to DB column `status`
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private Status status = Status.PENDING;

    public enum Role {
        EMPLOYEE,
        HR_MANAGER,
        ADMIN
    }

    public enum Status {
        PENDING,
        ACTIVE,
        REJECTED
    }
}
