package com.red.api.presentations;

import jakarta.validation.constraints.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/presentation-types")
@RequiredArgsConstructor
public class PresentationTypeController {

    private static final Logger log = LoggerFactory.getLogger(PresentationTypeController.class);

    private final PresentationTypeRepo repo;

    @GetMapping
    public List<PresentationType> list() {
        log.info("Listing all presentation types");
        return repo.findAll();
    }

    record CreatePT(
            @NotBlank String name,
            @NotNull @Min(10) Integer durationMin,
            String description,
            Integer gradeMin,
            Integer gradeMax
    ) {}

    @PostMapping
    public PresentationType create(@RequestBody CreatePT body) {
        log.info("Creating presentation type: {}", body.name());
        var pt = new PresentationType();
        pt.setName(body.name());
        pt.setDurationMin(body.durationMin());
        pt.setDescription(body.description());
        pt.setGradeMin(body.gradeMin());
        pt.setGradeMax(body.gradeMax());
        pt.setIsActive(true);
        PresentationType saved = repo.save(pt);
        log.info("Presentation type created - ID: {}, Name: {}", saved.getId(), saved.getName());
        return saved;
    }
}
