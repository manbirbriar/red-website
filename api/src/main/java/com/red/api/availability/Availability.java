package com.red.api.availability;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Availability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime start;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime end;

    private String location;

    private Integer capacity;

    @Column(nullable = false)
    private String status = "available"; // available, booked, pending

    @Column(nullable = false)
    private Boolean isActive = true;
}
