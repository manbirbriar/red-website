package com.red.api.booking;

import com.red.api.availability.Availability;
import com.red.api.availability.AvailabilityRepository;
import com.red.api.notifications.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(BookingController.class);

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
        log.info("Creating booking for {} at {} (slotId: {})", request.school(), request.email(), request.slotId());
        Availability availability = availabilityRepository.findById(request.slotId())
                .orElseThrow(() -> {
                    log.error("Booking creation failed - slot not found: {}", request.slotId());
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Availability slot not found");
                });

        if (!Boolean.TRUE.equals(availability.getIsActive())) {
            log.warn("Booking creation failed - slot {} is inactive", request.slotId());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This slot is no longer active");
        }

        if (!"available".equalsIgnoreCase(availability.getStatus())) {
            log.warn("Booking creation failed - slot {} status is: {}", request.slotId(), availability.getStatus());
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

        log.info("Booking created successfully - ID: {}, School: {}, Slot: {}", saved.getId(), saved.getSchool(), saved.getSlotLabel());
        emailService.sendBookingPendingEmail(saved);

        return saved;
    }

    @GetMapping("/cancellations/{token}")
    public CancellationResponse getBookingForCancellation(@PathVariable String token) {
        log.info("Cancellation lookup for token: {}...", token.substring(0, Math.min(8, token.length())));
        Booking booking = repository.findByCancellationToken(token)
                .orElseThrow(() -> {
                    log.warn("Cancellation lookup failed - booking not found for token");
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found");
                });

        return toCancellationResponse(booking);
    }

    @PostMapping("/cancellations/{token}")
    @Transactional
    public CancellationResponse cancelBooking(@PathVariable String token) {
        log.info("Cancellation request for token: {}...", token.substring(0, Math.min(8, token.length())));
        Booking booking = repository.findByCancellationToken(token)
                .orElseThrow(() -> {
                    log.error("Cancellation failed - booking not found for token");
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found");
                });

        if ("cancelled".equalsIgnoreCase(booking.getStatus())) {
            log.info("Booking {} already cancelled", booking.getId());
            return toCancellationResponse(booking);
        }

        if ("rejected".equalsIgnoreCase(booking.getStatus())) {
            log.warn("Cancellation failed - booking {} already rejected", booking.getId());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This booking request has already been rejected.");
        }

        booking.setStatus("cancelled");
        Booking saved = repository.save(booking);

        updateAvailabilityStatus(saved.getSlotId(), "cancelled");
        log.info("Booking cancelled - ID: {}, School: {}", saved.getId(), saved.getSchool());
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
