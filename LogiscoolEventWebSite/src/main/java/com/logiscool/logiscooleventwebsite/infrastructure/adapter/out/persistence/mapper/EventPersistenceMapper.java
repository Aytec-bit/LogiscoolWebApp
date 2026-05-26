package com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.mapper;

import com.logiscool.logiscooleventwebsite.domain.model.Event;
import com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.entity.EventJpaEntity;

public class EventPersistenceMapper {

    private EventPersistenceMapper() {}

    public static Event toDomain(EventJpaEntity entity) {
        return new Event(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getLocation(),
                entity.getType(),
                entity.getTargetAge(),
                entity.getSeat(),
                entity.getDate(),
                entity.getLengthTime(),
                entity.getPrice()
        );
    }

    public static EventJpaEntity toJpaEntity(Event event) {
        return new EventJpaEntity(
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
