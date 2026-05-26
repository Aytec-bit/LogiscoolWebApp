package com.logiscool.logiscooleventwebsite.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
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
