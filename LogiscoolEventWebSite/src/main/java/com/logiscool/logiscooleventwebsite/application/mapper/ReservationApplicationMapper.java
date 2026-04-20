package com.logiscool.logiscooleventwebsite.application.mapper;

import com.logiscool.logiscooleventwebsite.application.dto.ReservationResponseDTO;
import com.logiscool.logiscooleventwebsite.domain.model.Reservation;

public class ReservationApplicationMapper {

    private ReservationApplicationMapper() {}

    public static ReservationResponseDTO toResponseDTO(Reservation reservation) {
        return new ReservationResponseDTO(
                reservation.getId(),
                reservation.getUserId(),
                EventApplicationMapper.toResponseDTO(reservation.getEvent()),
                reservation.getReservationDate(),
                reservation.getStatus()
        );
    }
}
