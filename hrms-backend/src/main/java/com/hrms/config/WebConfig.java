package com.hrms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global Web configuration for CORS and MVC.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // allow the frontend origin (explicit, not "*")
                .allowedOriginPatterns("http://localhost:3000")
                // allow cookies / credentials
                .allowCredentials(true)
                // allowed HTTP methods
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // allow common headers from client
                .allowedHeaders("*")
                // expose any headers you need in the client (for example Set-Cookie if needed)
                .exposedHeaders("Set-Cookie");
    }
}
