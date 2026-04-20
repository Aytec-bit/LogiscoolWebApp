package com.logiscool.logiscooleventwebsite.application.service;

import com.logiscool.logiscooleventwebsite.domain.model.Event;
import com.logiscool.logiscooleventwebsite.domain.port.in.EventUseCase;
import com.logiscool.logiscooleventwebsite.domain.port.out.EventRepository;
import org.springframework.stereotype.Service;

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
    public Optional<Event> findById(Long id) {
        return eventRepository.findById(id);
    }

    @Override
    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public void deleteById(Long id) {
        eventRepository.deleteById(id);
    }
}
