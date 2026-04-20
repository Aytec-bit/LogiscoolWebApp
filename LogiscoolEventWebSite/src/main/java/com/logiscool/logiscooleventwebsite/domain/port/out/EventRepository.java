package com.logiscool.logiscooleventwebsite.domain.port.out;

import com.logiscool.logiscooleventwebsite.domain.model.Event;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface EventRepository {
    List<Event> findAll();
    Optional<Event> findById(Long id);
    Event save(Event event);
    void deleteById(Long id);

}
