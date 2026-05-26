package com.logiscool.logiscooleventwebsite.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String type;
    private String targetAge;
    private Integer seat;
    private LocalDateTime date;
    private LocalTime lengthTime;
    private BigDecimal price;
}
