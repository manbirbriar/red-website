package com.red.api.admin;

import com.red.api.config.AppProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthController.class);

    private final AdminAuthService authService;
    private final AppProperties appProperties;

    record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    record LoginResponse(String token, long expiresInMinutes) {}

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        log.info("Admin login attempt for username: {}", request.username());
        String token = authService.authenticate(request.username(), request.password());
        if (token == null) {
            log.warn("Failed admin login attempt for username: {}", request.username());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        log.info("Successful admin login for username: {}", request.username());
        long ttl = Optional.ofNullable(appProperties.admin())
                .map(AppProperties.Admin::sessionTtlMinutes)
                .orElse(240L);
        return new LoginResponse(token, ttl);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(name = "X-Admin-Token", required = false) String token) {
        if (token == null || token.isBlank()) {
            log.warn("Admin logout attempt with missing token");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing admin token");
        }

        log.info("Admin logout for token: {}...", token.substring(0, Math.min(8, token.length())));
        authService.invalidate(token);
        return ResponseEntity.noContent().build();
    }
}
