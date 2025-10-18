package com.red.api.presentations;

import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/presentation-types")
@RequiredArgsConstructor
public class PresentationTypeController {

    private final PresentationTypeRepo repo;

    @GetMapping
    public List<PresentationType> list() {
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
        var pt = new PresentationType();
        pt.setName(body.name());
        pt.setDurationMin(body.durationMin());
        pt.setDescription(body.description());
        pt.setGradeMin(body.gradeMin());
        pt.setGradeMax(body.gradeMax());
        pt.setIsActive(true);
        return repo.save(pt);
    }
}
