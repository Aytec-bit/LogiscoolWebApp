package com.logiscool.logiscooleventwebsite.domain.port.out;

import com.logiscool.logiscooleventwebsite.domain.model.Reservation;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository {
    List<Reservation> findAll();
    Optional<Reservation> findById(Long id);
    Reservation save(Reservation reservation);
    void deleteById(Long id);
    List<Reservation> findByUserId(String userId);
    boolean existsByUserIdAndEventId(String userId, Long eventId);
}
