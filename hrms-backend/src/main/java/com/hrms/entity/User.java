package com.hrms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Status status;

    // other fields, relationships...

    // Hide the password from JSON output — do not remove the setter.
    @JsonIgnore
    public String getPasswordHash() {
        return passwordHash;
    }

    // keep the setter (used when creating/updating passwords), do not annotate with @JsonProperty
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public enum Role {
        ADMIN, EMPLOYEE, HR_MANAGER
    }

    public enum Status {
        PENDING, ACTIVE, REJECTED, INACTIVE
    }
}
