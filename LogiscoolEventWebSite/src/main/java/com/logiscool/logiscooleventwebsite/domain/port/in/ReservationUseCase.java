package com.logiscool.logiscooleventwebsite.domain.port.in;

import com.logiscool.logiscooleventwebsite.domain.model.Reservation;

import java.util.List;

public interface ReservationUseCase {
    Reservation createReservation(String userId, Long eventId);
    List<Reservation> findByUserId(String userId);
    void cancelReservation(Long id, String requestingUserId);
}
