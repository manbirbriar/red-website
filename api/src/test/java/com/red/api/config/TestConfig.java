package com.red.api.config;

import com.red.api.admin.AdminAuthService;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import static org.mockito.Mockito.mock;

@TestConfiguration
public class TestConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        return new JavaMailSenderImpl();
    }

    @Bean
    public AdminAuthService adminAuthService() {
        return mock(AdminAuthService.class);
    }

    @Bean
    public AppProperties appProperties() {
        return new AppProperties(
                "http://localhost:3000",
                "test@example.com",
                "copy@example.com",
                new AppProperties.Admin("admin", "admin", 60)
        );
    }
}
