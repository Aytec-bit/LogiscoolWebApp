package com.logiscool.logiscooleventwebsite.application.service;

import com.logiscool.logiscooleventwebsite.domain.exception.EventNotFoundException;
import com.logiscool.logiscooleventwebsite.domain.model.Event;
import com.logiscool.logiscooleventwebsite.domain.port.in.EventUseCase;
import com.logiscool.logiscooleventwebsite.domain.port.out.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EventService implements EventUseCase {
    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public List<Event> findAll() {
        return eventRepository.findAll();
    }

    @Override
    public List<Event> findByFilters(String location, String type, String targetAge) {
        return eventRepository.findByFilters(location, type, targetAge);
    }

    @Override
    public Optional<Event> findById(Long id) {
        return eventRepository.findById(id);
    }

    @Override
    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    @Transactional
    public Event updateEvent(Long id, Event event) {
        eventRepository.findById(id).orElseThrow(() -> new EventNotFoundException(id));
        event.setId(id);
        return eventRepository.save(event);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        eventRepository.findById(id).orElseThrow(() -> new EventNotFoundException(id));
        eventRepository.deleteById(id);
    }

    @Override
    public List<String> getDistinctLocations() {
        return eventRepository.findDistinctLocations();
    }

    @Override
    public List<String> getDistinctTypes() {
        return eventRepository.findDistinctTypes();
    }

    @Override
    public List<String> getDistinctTargetAges() {
        return eventRepository.findDistinctTargetAges();
    }
}
