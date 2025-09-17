package com.hrms.dto;

import lombok.Data;

@Data
public class RegistrationRequest {
    private String email;
    private String password;
    private String role;       // added so controller can call getRole()
    private String firstName;
    private String lastName;
}
