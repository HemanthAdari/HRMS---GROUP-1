package com.hrms.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;     // instead of username
    private String password;
}
