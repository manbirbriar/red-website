package com.red.api.config;

import com.red.api.admin.AdminAuthInterceptor;
import com.red.api.admin.AdminAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.LinkedHashSet;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AdminAuthService adminAuthService;
    private final AppProperties appProperties;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        Set<String> allowedOrigins = new LinkedHashSet<>();
        allowedOrigins.add("http://localhost:5173");
        allowedOrigins.add("http://localhost:3000");
        if (appProperties.frontendBaseUrl() != null && !appProperties.frontendBaseUrl().isBlank()) {
            allowedOrigins.add(appProperties.frontendBaseUrl().replaceAll("/+$", ""));
        }

        String[] originsArray = allowedOrigins.toArray(String[]::new);

        registry.addMapping("/availability")
                .allowedOrigins(originsArray)
                .allowedMethods("GET", "OPTIONS");
        registry.addMapping("/bookings/**")
                .allowedOrigins(originsArray)
                .allowedMethods("GET", "POST", "PATCH", "OPTIONS");
        registry.addMapping("/admin/**")
                .allowedOrigins(originsArray)
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS");
        registry.addMapping("/api/**")
                .allowedOrigins(originsArray)
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AdminAuthInterceptor(adminAuthService))
                .addPathPatterns("/admin/**")
                .excludePathPatterns("/admin/auth/login");
    }
}
