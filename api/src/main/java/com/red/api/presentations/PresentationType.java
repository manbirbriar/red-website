package com.red.api.presentations;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Getter @Setter
public class PresentationType {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private Integer durationMin;

    private Integer gradeMin;
    private Integer gradeMax;

    @Column(nullable = false)
    private Boolean isActive = true;
}
