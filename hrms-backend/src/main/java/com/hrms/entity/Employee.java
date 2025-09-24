package com.hrms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id")
    private Integer employeeId;

    // link to user (one-to-one)
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(length = 50)
    private String department;

    @Column(length = 50)
    private String position;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String address;        // combined address (address1 + address2 if used)

    @Column(name = "address2", length = 255)
    private String address2;       // optional second line

    @Column(name = "salary")
    private Double salary;

    @Column(length = 10)
    private String gender;         // e.g. "male","female","other"

    @Column(name = "hire_date")
    private LocalDate hireDate;

    // Derived property not stored in DB
    @Transient
    public String getFullName() {
        return (firstName != null ? firstName : "") + (lastName != null && !lastName.isBlank() ? " " + lastName : "");
    }
}
