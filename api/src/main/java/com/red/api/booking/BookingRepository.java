package com.red.api.booking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStatusOrderByCreatedAtDesc(String status);

    Optional<Booking> findTopBySlotIdOrderByCreatedAtDesc(String slotId);

    Optional<Booking> findByCancellationToken(String cancellationToken);
}
