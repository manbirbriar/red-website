package com.red.api.booking;

import com.red.api.availability.Availability;
import com.red.api.availability.AvailabilityRepository;
import com.red.api.notifications.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    private final EmailService emailService;

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
        booking.setCreatedAt(LocalDateTime.now());

        Booking saved = repository.save(booking);

        availability.setStatus("pending");
        availabilityRepository.save(availability);

        emailService.sendBookingPendingEmail(saved);

        return saved;
    }

    @GetMapping("/cancellations/{token}")
    public CancellationResponse getBookingForCancellation(@PathVariable String token) {
        Booking booking = repository.findByCancellationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        return toCancellationResponse(booking);
    }

    @PostMapping("/cancellations/{token}")
    @Transactional
    public CancellationResponse cancelBooking(@PathVariable String token) {
        Booking booking = repository.findByCancellationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if ("cancelled".equalsIgnoreCase(booking.getStatus())) {
            return toCancellationResponse(booking);
        }

        if ("rejected".equalsIgnoreCase(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This booking request has already been rejected.");
        }

        booking.setStatus("cancelled");
        Booking saved = repository.save(booking);

        updateAvailabilityStatus(saved.getSlotId(), "cancelled");
        emailService.sendBookingCancelledEmail(saved);

        return toCancellationResponse(saved);
    }

    public record CancellationResponse(
            Long bookingId,
            String status,
            String slotLabel,
            String teacherName,
            String school,
            String presentationType,
            String location
    ) {}

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
        if ("cancelled".equalsIgnoreCase(bookingStatus) || "rejected".equalsIgnoreCase(bookingStatus)) {
            availability.setStatus("available");
        } else if ("confirmed".equalsIgnoreCase(bookingStatus)) {
            availability.setStatus("booked");
        } else if ("pending".equalsIgnoreCase(bookingStatus)) {
            availability.setStatus("pending");
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

    private CancellationResponse toCancellationResponse(Booking booking) {
        return new CancellationResponse(
                booking.getId(),
                booking.getStatus(),
                booking.getSlotLabel(),
                booking.getName(),
                booking.getSchool(),
                booking.getPresentationType(),
                booking.getLocation()
        );
    }
}
