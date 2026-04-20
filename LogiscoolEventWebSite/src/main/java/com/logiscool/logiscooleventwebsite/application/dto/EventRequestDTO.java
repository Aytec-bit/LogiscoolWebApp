package com.logiscool.logiscooleventwebsite.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRequestDTO {
    private String title;
    private String description;
    private String location;
    private Integer seat;
    private LocalDateTime date;
    private LocalTime lengthTime;
}
