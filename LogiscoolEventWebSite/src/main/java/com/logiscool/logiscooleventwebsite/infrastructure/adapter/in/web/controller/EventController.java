package com.logiscool.logiscooleventwebsite.infrastructure.adapter.in.web.controller;

import com.logiscool.logiscooleventwebsite.application.dto.EventRequestDTO;
import com.logiscool.logiscooleventwebsite.application.dto.EventResponseDTO;
import com.logiscool.logiscooleventwebsite.application.mapper.EventApplicationMapper;
import com.logiscool.logiscooleventwebsite.domain.port.in.EventUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventUseCase eventUseCase;

    public EventController(EventUseCase eventUseCase) {
        this.eventUseCase = eventUseCase;
    }

    /**
     * GET /api/events
     * Supports optional filter query parameters: location, type, targetAge
     * Example: GET /api/events?type=Scratch&targetAge=7-10+ans
     */
    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAllEvents(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String targetAge
    ) {
        boolean hasFilters = isNotBlank(location) || isNotBlank(type) || isNotBlank(targetAge);

        List<EventResponseDTO> events;
        if (hasFilters) {
            events = eventUseCase.findByFilters(
                    isNotBlank(location) ? location : null,
                    isNotBlank(type) ? type : null,
                    isNotBlank(targetAge) ? targetAge : null
            ).stream()
                    .map(EventApplicationMapper::toResponseDTO)
                    .toList();
        } else {
            events = eventUseCase.findAll().stream()
                    .map(EventApplicationMapper::toResponseDTO)
                    .toList();
        }
        return ResponseEntity.ok(events);
    }

    /**
     * GET /api/events/filter-options
     * Returns distinct values for all filter dropdowns (locations, types, targetAges)
     */
    @GetMapping("/filter-options")
    public ResponseEntity<Map<String, List<String>>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("locations", eventUseCase.getDistinctLocations());
        options.put("types", eventUseCase.getDistinctTypes());
        options.put("targetAges", eventUseCase.getDistinctTargetAges());
        return ResponseEntity.ok(options);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getEventById(@PathVariable Long id) {
        return eventUseCase.findById(id)
                .map(EventApplicationMapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(@RequestBody EventRequestDTO dto) {
        EventResponseDTO response = EventApplicationMapper.toResponseDTO(
                eventUseCase.createEvent(EventApplicationMapper.toDomain(dto))
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponseDTO> updateEvent(@PathVariable Long id, @RequestBody EventRequestDTO dto) {
        EventResponseDTO response = EventApplicationMapper.toResponseDTO(
                eventUseCase.updateEvent(id, EventApplicationMapper.toDomain(dto))
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventUseCase.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }
}
