package com.red.api.admin;

import com.red.api.config.AppProperties;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminAuthService {

    private final Map<String, Instant> activeSessions = new ConcurrentHashMap<>();
    private final AppProperties appProperties;

    public AdminAuthService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public String authenticate(String username, String password) {
        AppProperties.Admin adminConfig = appProperties.admin();
        if (adminConfig == null
                || adminConfig.username() == null
                || adminConfig.username().isBlank()
                || adminConfig.password() == null
                || adminConfig.password().isBlank()) {
            throw new IllegalStateException("Admin credentials are not configured");
        }

        if (!adminConfig.username().equals(username) || !adminConfig.password().equals(password)) {
            return null;
        }

        String token = UUID.randomUUID().toString();
        long ttlMinutes = Optional.ofNullable(adminConfig.sessionTtlMinutes()).orElse(240L);
        Instant expiry = Instant.now().plus(ttlMinutes, ChronoUnit.MINUTES);
        activeSessions.put(token, expiry);
        return token;
    }

    public boolean isTokenValid(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        Instant expiry = activeSessions.get(token);
        if (expiry == null) {
            return false;
        }

        if (expiry.isBefore(Instant.now())) {
            activeSessions.remove(token);
            return false;
        }

        return true;
    }

    public void invalidate(String token) {
        if (token != null) {
            activeSessions.remove(token);
        }
    }
}
