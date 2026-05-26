package com.logiscool.logiscooleventwebsite.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    private Long id;
    private String userId;
    private Event event;
    private LocalDateTime reservationDate;
    private String status;
}
