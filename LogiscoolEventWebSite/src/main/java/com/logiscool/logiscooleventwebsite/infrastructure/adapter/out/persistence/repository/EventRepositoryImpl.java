package com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.repository;

import com.logiscool.logiscooleventwebsite.domain.model.Event;
import com.logiscool.logiscooleventwebsite.domain.port.out.EventRepository;
import com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.mapper.EventPersistenceMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class EventRepositoryImpl implements EventRepository {
    private final EventJpaRepository eventJpaRepository;

    public EventRepositoryImpl(EventJpaRepository eventJpaRepository) {
        this.eventJpaRepository = eventJpaRepository;
    }

    @Override
    public List<Event> findAll() {
        return eventJpaRepository.findAll().stream()
                .map(EventPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public List<Event> findByFilters(String location, String type, String targetAge) {
        return eventJpaRepository.findByFilters(location, type, targetAge).stream()
                .map(EventPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Event> findById(Long id) {
        return eventJpaRepository.findById(id)
                .map(EventPersistenceMapper::toDomain);
    }

    @Override
    public Event save(Event event) {
        return EventPersistenceMapper.toDomain(
                eventJpaRepository.save(EventPersistenceMapper.toJpaEntity(event))
        );
    }

    @Override
    public void deleteById(Long id) {
        eventJpaRepository.deleteById(id);
    }

    @Override
    public List<String> findDistinctLocations() {
        return eventJpaRepository.findDistinctLocations();
    }

    @Override
    public List<String> findDistinctTypes() {
        return eventJpaRepository.findDistinctTypes();
    }

    @Override
    public List<String> findDistinctTargetAges() {
        return eventJpaRepository.findDistinctTargetAges();
    }
}
