package com.hrms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

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

    // link to users table
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(length = 255)
    private String address;        // address line 1

    @Column(name = "address2", length = 255)
    private String address2;       // address line 2

    @Column(length = 50)
    private String department;

    @Column(length = 50)
    private String position;

    @Column(length = 20)
    private String phone;

    @Column(name = "salary")
    private Double salary;

    @Column(length = 10)
    private String gender;         // e.g. "male", "female", "other"

    @Column(name = "hire_date")
    private java.sql.Date hireDate;

    // NEW: leaves column to store number of used/approved leaves (nullable)
    @Column(name = "leaves")
    private Integer leaves;

    // Provide a JSON property fullName combining first+last
    @JsonProperty("fullName")
    public String getFullName() {
        String f = firstName == null ? "" : firstName.trim();
        String l = lastName == null ? "" : lastName.trim();
        if (f.isEmpty() && l.isEmpty()) return "";
        if (l.isEmpty()) return f;
        if (f.isEmpty()) return l;
        return f + " " + l;
    }
}
