package com.red.api.availability;

import com.red.api.booking.BookingRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/admin/availability")
@RequiredArgsConstructor
public class AdminAvailabilityController {

    private final AvailabilityRepository availabilityRepository;
    private final BookingRepository bookingRepository;

    record CreateAvailabilityRequest(
            @NotNull LocalDateTime start,
            @NotNull LocalDateTime end,
            String location,
            Integer capacity
    ) {}

    record UpdateAvailabilityRequest(
            LocalDateTime start,
            LocalDateTime end,
            String location,
            Integer capacity,
            String status,
            Boolean isActive
    ) {}

    @GetMapping
    public List<Availability> list() {
        return availabilityRepository.findAll();
    }

    @PostMapping
    @Transactional
    public Availability create(@Valid @RequestBody CreateAvailabilityRequest request) {
        if (!request.end().isAfter(request.start())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        Availability availability = new Availability();
        availability.setStart(request.start());
        availability.setEnd(request.end());

        String location = request.location();
        if (location == null || location.isBlank()) {
            location = "To be confirmed";
        }
        availability.setLocation(location);

        availability.setCapacity(request.capacity());
        availability.setStatus("available");
        availability.setIsActive(true);

        return availabilityRepository.save(availability);
    }

    @PatchMapping("/{id}")
    @Transactional
    public Availability update(@PathVariable Long id, @RequestBody UpdateAvailabilityRequest request) {
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Availability slot not found"));

        if (request.start() != null) {
            availability.setStart(request.start());
        }
        if (request.end() != null) {
            availability.setEnd(request.end());
        }
        if (request.location() != null) {
            String updatedLocation = request.location().isBlank() ? "To be confirmed" : request.location();
            availability.setLocation(updatedLocation);
        }
        if (request.capacity() != null) {
            availability.setCapacity(request.capacity());
        }
        if (request.status() != null) {
            String normalisedStatus = request.status().toLowerCase(Locale.ROOT);
            availability.setStatus(normalisedStatus);
        }
        if (request.isActive() != null) {
            availability.setIsActive(request.isActive());
        }

        if (!availability.getEnd().isAfter(availability.getStart())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        return availabilityRepository.save(availability);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void disable(@PathVariable Long id) {
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Availability slot not found"));

        availability.setIsActive(false);
        availability.setStatus("available");
        availabilityRepository.save(availability);

        bookingRepository.findTopBySlotIdOrderByCreatedAtDesc(String.valueOf(availability.getId()))
                .ifPresent(booking -> {
                    if (!"cancelled".equalsIgnoreCase(booking.getStatus()) && !"rejected".equalsIgnoreCase(booking.getStatus())) {
                        booking.setStatus("cancelled");
                        bookingRepository.save(booking);
                    }
                });
    }
}
