package com.logiscool.logiscooleventwebsite.domain.port.in;

import com.logiscool.logiscooleventwebsite.domain.model.Event;

import java.util.List;
import java.util.Optional;

public interface EventUseCase {
    List<Event> findAll();
    Optional<Event> findById(Long id);
    Event createEvent(Event event);
    void deleteById(Long id);
}
