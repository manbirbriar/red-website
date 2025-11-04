package com.red.api.booking;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "teacher_name", nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String school;

    @Column(name = "presentation_type", nullable = false)
    private String presentationType;

    @Column(name = "presentation_location", nullable = false)
    private String location;

    @Column(name = "extra_notes", columnDefinition = "text")
    private String extraNotes;

    @Column(name = "slot_id", nullable = false)
    private String slotId;

    @Column(name = "slot_label", columnDefinition = "text", nullable = false)
    private String slotLabel;

    @Column(name = "presentation_start", nullable = false)
    private LocalDateTime presentationStart;

    @Column(name = "presentation_end")
    private LocalDateTime presentationEnd;

    @Column(nullable = false)
    private String status = "pending"; // pending, confirmed, rejected, cancelled

    @Column(name = "cancellation_token", nullable = false, unique = true, updatable = false)
    private String cancellationToken;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "pending";
        }
        if (cancellationToken == null || cancellationToken.isBlank()) {
            cancellationToken = UUID.randomUUID().toString();
        }
    }
}
