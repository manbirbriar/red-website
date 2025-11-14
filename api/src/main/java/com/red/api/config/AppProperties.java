package com.red.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String frontendBaseUrl,
        String mailFromAddress,
        String mailCopyAddress,
        Admin admin
) {
    public record Admin(
            String username,
            String password,
            long sessionTtlMinutes
    ) {
    }
}
