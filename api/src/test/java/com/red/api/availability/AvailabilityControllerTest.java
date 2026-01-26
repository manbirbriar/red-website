package com.red.api.availability;

import com.red.api.booking.BookingRepository;
import com.red.api.config.TestConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AvailabilityController.class)
@Import(TestConfig.class)
class AvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AvailabilityRepository availabilityRepository;

    @MockBean
    private BookingRepository bookingRepository;

    @BeforeEach
    void setUp() {
        // Prevent @PostConstruct initTestData from trying to create data
        when(availabilityRepository.count()).thenReturn(1L);
    }

    @Test
    void shouldReturnAvailableSlots() throws Exception {
        // Arrange
        Availability slot = new Availability();
        slot.setId(1L);
        slot.setStart(LocalDateTime.now().plusDays(1));
        slot.setEnd(LocalDateTime.now().plusDays(1).plusHours(1));
        slot.setLocation("Test Location");
        slot.setCapacity(30);
        slot.setStatus("available");
        slot.setIsActive(true);

        when(availabilityRepository.findByIsActiveTrueAndStartAfterOrderByStartAsc(any(LocalDateTime.class)))
                .thenReturn(List.of(slot));

        // Act & Assert
        mockMvc.perform(get("/availability")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].location", is("Test Location")))
                .andExpect(jsonPath("$[0].status", is("available")));
    }
    
    @Test
    void shouldReturnEmptyListWhenNoSlots() throws Exception {
        // Arrange
        when(availabilityRepository.findByIsActiveTrueAndStartAfterOrderByStartAsc(any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/availability")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
