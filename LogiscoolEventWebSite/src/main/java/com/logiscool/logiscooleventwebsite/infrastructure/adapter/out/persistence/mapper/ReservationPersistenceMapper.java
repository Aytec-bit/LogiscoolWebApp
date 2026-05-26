package com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.mapper;

import com.logiscool.logiscooleventwebsite.domain.model.Reservation;
import com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.entity.ReservationJpaEntity;

public class ReservationPersistenceMapper {

    private ReservationPersistenceMapper() {}

    public static Reservation toDomain(ReservationJpaEntity entity) {
        return new Reservation(
                entity.getId(),
                entity.getUserId(),
                EventPersistenceMapper.toDomain(entity.getEvent()),
                entity.getReservationDate(),
                entity.getStatus()
        );
    }

    public static ReservationJpaEntity toJpaEntity(Reservation reservation) {
        return new ReservationJpaEntity(
                reservation.getId(),
                reservation.getUserId(),
                EventPersistenceMapper.toJpaEntity(reservation.getEvent()),
                reservation.getReservationDate(),
                reservation.getStatus()
        );
    }
}
