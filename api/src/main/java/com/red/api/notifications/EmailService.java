package com.red.api.notifications;

import com.red.api.booking.Booking;
import com.red.api.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    public void sendBookingPendingEmail(Booking booking) {
        String subject = "[RED] Booking request received";
        String body = """
                Hello %s,

                Thanks for submitting a RED presentation request. Our team will review the details and get back to you shortly.

                Booking details:
                  • Teacher: %s
                  • School: %s
                  • Presentation: %s
                  • Location: %s
                  • Requested slot: %s

                If you need to cancel this request, you can do so at any time with the link below:
                %s

                We'll follow up within 48 hours to confirm next steps.

                — The RED Team
                """.formatted(
                Optional.ofNullable(booking.getName()).orElse("there"),
                Optional.ofNullable(booking.getName()).orElse("N/A"),
                Optional.ofNullable(booking.getSchool()).orElse("N/A"),
                Optional.ofNullable(booking.getPresentationType()).orElse("N/A"),
                Optional.ofNullable(booking.getLocation()).orElse("To be determined"),
                Optional.ofNullable(booking.getSlotLabel()).orElse("To be scheduled"),
                buildCancellationLink(booking)
        );

        sendEmail(booking.getEmail(), subject, body);
    }

    public void sendBookingConfirmedEmail(Booking booking) {
        String subject = "[RED] Booking confirmed";
        String body = """
                Hello %s,

                Great news — your RED presentation request has been confirmed.

                Booking details:
                  • Teacher: %s
                  • School: %s
                  • Presentation: %s
                  • Location: %s
                  • Scheduled slot: %s

                If anything changes, you can still cancel using the link below:
                %s

                We look forward to meeting your class!

                — The RED Team
                """.formatted(
                Optional.ofNullable(booking.getName()).orElse("there"),
                Optional.ofNullable(booking.getName()).orElse("N/A"),
                Optional.ofNullable(booking.getSchool()).orElse("N/A"),
                Optional.ofNullable(booking.getPresentationType()).orElse("N/A"),
                Optional.ofNullable(booking.getLocation()).orElse("To be determined"),
                Optional.ofNullable(booking.getSlotLabel()).orElse("To be scheduled"),
                buildCancellationLink(booking)
        );

        sendEmail(booking.getEmail(), subject, body);
    }

    public void sendBookingRejectedEmail(Booking booking) {
        String subject = "[RED] Booking request update";
        String body = """
                Hello %s,

                Thanks for your interest in a RED presentation. Unfortunately we’re unable to accommodate the requested time.

                Booking details:
                  • Teacher: %s
                  • School: %s
                  • Presentation: %s
                  • Requested slot: %s

                Please reach out at reducalgary@gmail.com if you'd like to explore alternate times.

                — The RED Team
                """.formatted(
                Optional.ofNullable(booking.getName()).orElse("there"),
                Optional.ofNullable(booking.getName()).orElse("N/A"),
                Optional.ofNullable(booking.getSchool()).orElse("N/A"),
                Optional.ofNullable(booking.getPresentationType()).orElse("N/A"),
                Optional.ofNullable(booking.getSlotLabel()).orElse("To be scheduled")
        );

        sendEmail(booking.getEmail(), subject, body);
    }

    public void sendBookingCancelledEmail(Booking booking) {
        String subject = "[RED] Booking cancellation confirmed";
        String body = """
                Hello %s,

                Your booking request has been cancelled. If this was a mistake, feel free to submit a new request on our website.

                Cancelled request details:
                  • Teacher: %s
                  • School: %s
                  • Presentation: %s
                  • Original slot: %s

                — The RED Team
                """.formatted(
                Optional.ofNullable(booking.getName()).orElse("there"),
                Optional.ofNullable(booking.getName()).orElse("N/A"),
                Optional.ofNullable(booking.getSchool()).orElse("N/A"),
                Optional.ofNullable(booking.getPresentationType()).orElse("N/A"),
                Optional.ofNullable(booking.getSlotLabel()).orElse("To be scheduled")
        );

        sendEmail(booking.getEmail(), subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            return;
        }

        String fromAddress = Optional.ofNullable(appProperties.mailFromAddress())
                .filter(value -> !value.isBlank())
                .orElse(null);

        if (fromAddress == null) {
            log.warn("Skipping email to {} because the from address is not configured", to);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            // Log but swallow so that a transient mail issue doesn't break the workflow
            // (this keeps the user experience smooth while still surfacing errors in server logs)
            log.error("Failed to send email to {}: {}", to, exception.getMessage());
        }
    }

    private String buildCancellationLink(Booking booking) {
        String baseUrl = Optional.ofNullable(appProperties.frontendBaseUrl())
                .map(url -> url.replaceAll("/+$", ""))
                .orElse("http://localhost:3000");

        String normalisedBaseUrl = normaliseBaseUrl(baseUrl);
        return normalisedBaseUrl + "/cancel?token=" + booking.getCancellationToken();
    }

    private String normaliseBaseUrl(String baseUrl) {
        try {
            URI uri = new URI(baseUrl);
            if (uri.getHost() != null && uri.getHost().equalsIgnoreCase("localhost")) {
                int desiredPort = 3000;
                if (uri.getPort() != desiredPort) {
                    uri = new URI(
                            uri.getScheme(),
                            uri.getUserInfo(),
                            uri.getHost(),
                            desiredPort,
                            uri.getPath(),
                            uri.getQuery(),
                            uri.getFragment()
                    );
                }
            }

            String cleaned = uri.toString().replaceAll("/+$", "");
            return cleaned.isEmpty() ? "http://localhost:3000" : cleaned;
        } catch (URISyntaxException exception) {
            log.warn("Invalid frontend base URL '{}' ({}). Falling back to http://localhost:3000.", baseUrl, exception.getMessage());
            return "http://localhost:3000";
        }
    }
}
