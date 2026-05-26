package com.logiscool.logiscooleventwebsite.application.mapper;

import com.logiscool.logiscooleventwebsite.application.dto.EventRequestDTO;
import com.logiscool.logiscooleventwebsite.application.dto.EventResponseDTO;
import com.logiscool.logiscooleventwebsite.domain.model.Event;

public class EventApplicationMapper {

    private EventApplicationMapper() {}

    public static Event toDomain(EventRequestDTO dto) {
        return new Event(
                null,
                dto.getTitle(),
                dto.getDescription(),
                dto.getLocation(),
                dto.getType(),
                dto.getTargetAge(),
                dto.getSeat(),
                dto.getDate(),
                dto.getLengthTime(),
                dto.getPrice()
        );
    }

    public static EventResponseDTO toResponseDTO(Event event) {
        return new EventResponseDTO(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getLocation(),
                event.getType(),
                event.getTargetAge(),
                event.getSeat(),
                event.getDate(),
                event.getLengthTime(),
                event.getPrice()
        );
    }
}
