package com.red.api.booking;

import com.red.api.availability.AvailabilityRepository;
import com.red.api.notifications.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private static final List<String> ALLOWED_STATUSES = List.of("pending", "confirmed", "rejected", "cancelled");

    private final BookingRepository bookingRepository;
    private final AvailabilityRepository availabilityRepository;
    private final EmailService emailService;

    @GetMapping
    public List<Booking> list(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return bookingRepository.findByStatusOrderByCreatedAtDesc(status.toLowerCase(Locale.ROOT));
        }
        return bookingRepository.findAll();
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public Booking adminUpdateStatus(@PathVariable Long id, @RequestParam String status) {
        String normalisedStatus = status == null ? null : status.trim().toLowerCase(Locale.ROOT);

        if (normalisedStatus == null || normalisedStatus.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        if (!ALLOWED_STATUSES.contains(normalisedStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported booking status: " + status);
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if ("cancelled".equalsIgnoreCase(booking.getStatus()) && !"cancelled".equals(normalisedStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cancelled bookings cannot be updated.");
        }

        if (normalisedStatus.equals(booking.getStatus())) {
            return booking;
        }

        booking.setStatus(normalisedStatus);
        Booking saved = bookingRepository.save(booking);

        updateAvailabilityStatus(saved);
        sendNotificationEmail(saved);

        return saved;
    }

    private void updateAvailabilityStatus(Booking booking) {
        if (booking.getSlotId() == null || booking.getSlotId().isBlank()) {
            return;
        }

        try {
            Long slotId = Long.parseLong(booking.getSlotId());
            availabilityRepository.findById(slotId).ifPresent(slot -> {
                switch (booking.getStatus()) {
                    case "pending" -> slot.setStatus("pending");
                    case "confirmed" -> slot.setStatus("booked");
                    case "rejected", "cancelled" -> slot.setStatus("available");
                    default -> {
                    }
                }
                availabilityRepository.save(slot);
            });
        } catch (NumberFormatException ignored) {
        }
    }

    private void sendNotificationEmail(Booking booking) {
        switch (booking.getStatus()) {
            case "confirmed" -> emailService.sendBookingConfirmedEmail(booking);
            case "rejected" -> emailService.sendBookingRejectedEmail(booking);
            case "cancelled" -> emailService.sendBookingCancelledEmail(booking);
            default -> {
            }
        }
    }
}
