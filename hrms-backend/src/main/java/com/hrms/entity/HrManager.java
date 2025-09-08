package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hr_managers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HrManager {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hr_id")
    private Integer hrId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(name = "office_location", length = 100)
    private String officeLocation;

    @Column(length = 20)
    private String phone;
}
