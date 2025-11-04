package com.red.api.availability;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByIsActiveTrueAndStartAfterOrderByStartAsc(LocalDateTime start);
}
