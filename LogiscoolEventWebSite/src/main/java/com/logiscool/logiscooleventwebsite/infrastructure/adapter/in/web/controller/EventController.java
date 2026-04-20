package com.logiscool.logiscooleventwebsite.infrastructure.adapter.in.web.controller;

import com.logiscool.logiscooleventwebsite.application.dto.EventRequestDTO;
import com.logiscool.logiscooleventwebsite.application.dto.EventResponseDTO;
import com.logiscool.logiscooleventwebsite.application.mapper.EventApplicationMapper;
import com.logiscool.logiscooleventwebsite.domain.port.in.EventUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventUseCase eventUseCase;

    public EventController(EventUseCase eventUseCase) {
        this.eventUseCase = eventUseCase;
    }

    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        List<EventResponseDTO> events = eventUseCase.findAll().stream()
                .map(EventApplicationMapper::toResponseDTO)
                .toList();
        return ResponseEntity.ok(events);
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventUseCase.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
