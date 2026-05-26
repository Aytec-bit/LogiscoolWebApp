package com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.repository;

import com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.entity.ReservationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationJpaRepository extends JpaRepository<ReservationJpaEntity, Long> {
    List<ReservationJpaEntity> findByUserId(String userId);
    // event_Id : naviguer vers le champ "event" puis son champ "id"
    boolean existsByUserIdAndEvent_Id(String userId, Long eventId);
}
