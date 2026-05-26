package com.logiscool.logiscooleventwebsite.domain.port.in;

import com.logiscool.logiscooleventwebsite.domain.model.Event;

import java.util.List;
import java.util.Optional;

public interface EventUseCase {
    List<Event> findAll();
    List<Event> findByFilters(String location, String type, String targetAge);
    Optional<Event> findById(Long id);
    Event createEvent(Event event);
    Event updateEvent(Long id, Event event);
    void deleteById(Long id);
    List<String> getDistinctLocations();
    List<String> getDistinctTypes();
    List<String> getDistinctTargetAges();
}
