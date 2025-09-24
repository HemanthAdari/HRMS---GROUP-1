package com.hrms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Global Web configuration for CORS and MVC.
 *
 * Note: Use allowedOriginPatterns when you need wildcard/pattern matching
 * together with allowCredentials(true). This is acceptable for development.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // For dev you can allow all origins by pattern; in production lock this down.
    private static final String ORIGIN_PATTERN = "*";

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // allow origin patterns (supports "*")
                .allowedOriginPatterns(ORIGIN_PATTERN)
                // allow cookies / credentials
                .allowCredentials(true)
                // allowed HTTP methods
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // allow common headers from client
                .allowedHeaders("*")
                // expose any headers you need in the client (for example Set-Cookie if needed)
                .exposedHeaders("Set-Cookie");
    }

    /**
     * Provide a CorsConfigurationSource bean as a fallback/provider for other parts of Spring
     * (some third-party filters may consult this bean).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // allow all origins by pattern (dev-only). For prod, use explicit origins.
        config.setAllowedOriginPatterns(List.of(ORIGIN_PATTERN));
        config.setAllowCredentials(true);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.addAllowedHeader(CorsConfiguration.ALL);
        config.addExposedHeader("Set-Cookie");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
