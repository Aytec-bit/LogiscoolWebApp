package com.logiscool.logiscooleventwebsite.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponseDTO {
    private Long id;
    private String userId;
    private EventResponseDTO event;
    private LocalDateTime reservationDate;
    private String status;
}
