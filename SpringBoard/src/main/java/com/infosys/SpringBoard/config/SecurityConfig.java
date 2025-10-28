package com.infosys.SpringBoard.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration; // NEW IMPORT
import org.springframework.web.cors.CorsConfigurationSource; // NEW IMPORT
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // NEW IMPORT
import java.util.Arrays; // NEW IMPORT

@Configuration
public class SecurityConfig {

    // --- 1. CORS Configuration Source (NEW) ---
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow the React frontend's origin
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); 
        
        // Allow common headers and methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*")); 
        
        // Important for allowing credentials (Basic Auth, Cookies, etc.)
        configuration.setAllowCredentials(true); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to ALL API paths
        source.registerCorsConfiguration("/**", configuration); 
        return source;
    }

    // --- 2. Security Filter Chain (Minimal Change) ---
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CRITICAL FIX: Integrate the CORS configuration bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Keep your existing rules unchanged:
            .csrf().disable() // disable CSRF for APIs
            .authorizeHttpRequests()
            .anyRequest().permitAll(); // allow all requests without authentication

        return http.build();
    }
}