package com.red.api.config;

import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer cors() {
        return new WebMvcConfigurer() {
            @Override public void addCorsMappings(CorsRegistry reg) {
                reg.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173","http://localhost:3000")
                        .allowedMethods("GET","POST","PATCH","DELETE");
            }
        };
    }
}
