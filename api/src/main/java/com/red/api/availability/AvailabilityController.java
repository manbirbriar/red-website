package com.red.api.availability;

import com.red.api.booking.BookingRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityRepository repository;
    private final BookingRepository bookingRepository;

    @GetMapping
    public List<AvailabilityResponse> getAvailability() {
        return repository.findByIsActiveTrueAndStartAfterOrderByStartAsc(LocalDateTime.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PostConstruct
    public void initTestData() {
        if (repository.count() == 0) {
            LocalDateTime startDate = LocalDateTime.of(2025, 11, 10, 13, 0);
            LocalDateTime endDate = LocalDateTime.of(2025, 11, 28, 13, 0);

            LocalDateTime pointer = startDate;
            while (!pointer.isAfter(endDate)) {
                switch (pointer.getDayOfWeek()) {
                    case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY ->
                            createSlot(pointer, pointer.plusHours(1), "To be confirmed", 35);
                    default -> {
                    }
                }

                pointer = pointer.plusDays(1);
            }
        }
    }

    private void createSlot(LocalDateTime start, LocalDateTime end, String location, Integer capacity) {
        Availability slot = new Availability();
        slot.setStart(start);
        slot.setEnd(end);
        slot.setLocation(location);
        slot.setCapacity(capacity);
        slot.setStatus("available");
        slot.setIsActive(true);
        repository.save(slot);
    }

    private AvailabilityResponse toResponse(Availability slot) {
        BookingDetails bookingDetails = "booked".equalsIgnoreCase(slot.getStatus())
                ? bookingRepository.findTopBySlotIdOrderByCreatedAtDesc(String.valueOf(slot.getId()))
                .map(booking -> new BookingDetails(
                        booking.getId(),
                        booking.getName(),
                        booking.getEmail(),
                        booking.getPhone(),
                        booking.getSchool(),
                        booking.getPresentationType(),
                        booking.getLocation(),
                        booking.getExtraNotes(),
                        booking.getStatus(),
                        booking.getCreatedAt(),
                        booking.getSlotLabel()
                ))
                .orElse(null)
                : null;

        return new AvailabilityResponse(
                slot.getId(),
                slot.getStart(),
                slot.getEnd(),
                slot.getLocation(),
                slot.getCapacity(),
                slot.getStatus(),
                slot.getIsActive(),
                bookingDetails
        );
    }

    public record AvailabilityResponse(
            Long id,
            LocalDateTime start,
            LocalDateTime end,
            String location,
            Integer capacity,
            String status,
            Boolean isActive,
            BookingDetails booking
    ) {}

    public record BookingDetails(
            Long id,
            String name,
            String email,
            String phone,
            String school,
            String presentationType,
            String location,
            String extraNotes,
            String status,
            LocalDateTime createdAt,
            String slotLabel
    ) {}
}
