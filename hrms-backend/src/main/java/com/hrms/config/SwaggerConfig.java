package com.hrms.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI hrmsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HRMS API")
                        .description("API documentation for HRMS Project")
                        .version("1.0.0"));
    }
}
