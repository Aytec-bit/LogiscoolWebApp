package com.logiscool.logiscooleventwebsite.application.service;

import com.logiscool.logiscooleventwebsite.domain.exception.EventNotFoundException;
import com.logiscool.logiscooleventwebsite.domain.model.Event;
import com.logiscool.logiscooleventwebsite.domain.model.Reservation;
import com.logiscool.logiscooleventwebsite.domain.port.in.ReservationUseCase;
import com.logiscool.logiscooleventwebsite.domain.port.out.EventRepository;
import com.logiscool.logiscooleventwebsite.domain.port.out.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService implements ReservationUseCase {
    private final ReservationRepository reservationRepository;
    private final EventRepository eventRepository;

    public ReservationService(ReservationRepository reservationRepository, EventRepository eventRepository) {
        this.reservationRepository = reservationRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public Reservation createReservation(String userId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        Reservation reservation = new Reservation(
                null,
                userId,
                event,
                LocalDateTime.now(),
                "CONFIRMED"
        );
        return reservationRepository.save(reservation);
    }

    @Override
    public List<Reservation> findByUserId(String userId) {
        return reservationRepository.findByUserId(userId);
    }

    @Override
    public void deleteById(Long id) {
        reservationRepository.deleteById(id);
    }
}
