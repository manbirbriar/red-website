package com.red.api.booking;

import com.red.api.availability.Availability;
import com.red.api.availability.AvailabilityRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private static final DateTimeFormatter SLOT_LABEL_FORMATTER =
            DateTimeFormatter.ofPattern("EEEE, MMMM d 'at' h:mm a", Locale.CANADA);

    private final BookingRepository repository;
    private final AvailabilityRepository availabilityRepository;

    @GetMapping
    public List<Booking> getAllBookings(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return repository.findByStatusOrderByCreatedAtDesc(status);
        }
        return repository.findAll();
    }

    record CreateBookingRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank String phone,
            @NotBlank String school,
            @NotBlank String presentationType,
            @NotBlank String location,
            String extraNotes,
            @NotNull Long slotId
    ) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Booking createBooking(@Valid @RequestBody CreateBookingRequest request) {
        Availability availability = availabilityRepository.findById(request.slotId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Availability slot not found"));

        if (!Boolean.TRUE.equals(availability.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This slot is no longer active");
        }

        if (!"available".equalsIgnoreCase(availability.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This slot has already been booked");
        }

        Booking booking = new Booking();
        booking.setName(request.name());
        booking.setEmail(request.email());
        booking.setPhone(request.phone());
        booking.setSchool(request.school());
        booking.setPresentationType(request.presentationType());
        booking.setLocation(request.location());
        booking.setExtraNotes(request.extraNotes());
        booking.setSlotId(String.valueOf(availability.getId()));
        booking.setSlotLabel(buildSlotLabel(availability.getStart(), availability.getEnd()));
        booking.setPresentationStart(availability.getStart());
        booking.setPresentationEnd(availability.getEnd());
        booking.setStatus("booked");
        booking.setCreatedAt(LocalDateTime.now());

        Booking saved = repository.save(booking);

        availability.setStatus("booked");
        availabilityRepository.save(availability);

        return saved;
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public Booking updateStatus(@PathVariable Long id, @RequestParam String status) {
        Booking booking = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        booking.setStatus(status);
        Booking saved = repository.save(booking);

        updateAvailabilityStatus(saved.getSlotId(), status);

        return saved;
    }

    private void updateAvailabilityStatus(String slotId, String bookingStatus) {
        if (slotId == null || slotId.isBlank()) {
            return;
        }

        Long parsedSlotId;
        try {
            parsedSlotId = Long.parseLong(slotId);
        } catch (NumberFormatException exception) {
            return;
        }

        Optional<Availability> availabilityOptional = availabilityRepository.findById(parsedSlotId);
        if (availabilityOptional.isEmpty()) {
            return;
        }

        Availability availability = availabilityOptional.get();
        if ("cancelled".equalsIgnoreCase(bookingStatus)) {
            availability.setStatus("available");
        } else if ("booked".equalsIgnoreCase(bookingStatus)) {
            availability.setStatus("booked");
        }

        availabilityRepository.save(availability);
    }

    private String buildSlotLabel(LocalDateTime start, LocalDateTime end) {
        if (start == null) {
            return "Presentation slot";
        }

        StringBuilder label = new StringBuilder(SLOT_LABEL_FORMATTER.format(start));
        if (end != null) {
            label.append(" – ").append(SLOT_LABEL_FORMATTER.format(end));
        }
        return label.toString();
    }
}
