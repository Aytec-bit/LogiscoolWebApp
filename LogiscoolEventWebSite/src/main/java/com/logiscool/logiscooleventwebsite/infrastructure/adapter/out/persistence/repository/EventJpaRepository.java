package com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.repository;

import com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.entity.EventJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventJpaRepository extends JpaRepository<EventJpaEntity, Long> {
}
