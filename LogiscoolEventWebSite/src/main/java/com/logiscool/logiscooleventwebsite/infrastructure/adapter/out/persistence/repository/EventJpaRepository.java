package com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.repository;

import com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.entity.EventJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventJpaRepository extends JpaRepository<EventJpaEntity, Long> {

    @Query("SELECT e FROM EventJpaEntity e WHERE " +
           "(:location IS NULL OR e.location = :location) AND " +
           "(:type IS NULL OR e.type = :type) AND " +
           "(:targetAge IS NULL OR e.targetAge = :targetAge) " +
           "ORDER BY e.date ASC")
    List<EventJpaEntity> findByFilters(
            @Param("location") String location,
            @Param("type") String type,
            @Param("targetAge") String targetAge
    );

    @Query("SELECT DISTINCT e.location FROM EventJpaEntity e WHERE e.location IS NOT NULL AND e.location <> '' ORDER BY e.location")
    List<String> findDistinctLocations();

    @Query("SELECT DISTINCT e.type FROM EventJpaEntity e WHERE e.type IS NOT NULL AND e.type <> '' ORDER BY e.type")
    List<String> findDistinctTypes();

    @Query("SELECT DISTINCT e.targetAge FROM EventJpaEntity e WHERE e.targetAge IS NOT NULL AND e.targetAge <> '' ORDER BY e.targetAge")
    List<String> findDistinctTargetAges();
}
