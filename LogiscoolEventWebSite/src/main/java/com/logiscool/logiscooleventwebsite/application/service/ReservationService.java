package com.logiscool.logiscooleventwebsite.application.service;

import com.logiscool.logiscooleventwebsite.domain.exception.EventNotFoundException;
import com.logiscool.logiscooleventwebsite.domain.model.Event;
import com.logiscool.logiscooleventwebsite.domain.model.Reservation;
import com.logiscool.logiscooleventwebsite.domain.port.in.ReservationUseCase;
import com.logiscool.logiscooleventwebsite.domain.port.out.EventRepository;
import com.logiscool.logiscooleventwebsite.domain.port.out.ReservationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    @Transactional
    public Reservation createReservation(String userId, Long eventId) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié.");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        // Reject past events
        if (event.getDate() != null && event.getDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Impossible de réserver un événement déjà passé.");
        }

        // Reject full events
        if (event.getSeat() <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet événement est complet.");
        }

        // Reject duplicate reservations
        if (reservationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous avez déjà réservé cet événement.");
        }

        // Decrement available seats
        event.setSeat(event.getSeat() - 1);
        eventRepository.save(event);

        Reservation reservation = new Reservation(null, userId, event, LocalDateTime.now(), "CONFIRMED");
        return reservationRepository.save(reservation);
    }

    @Override
    public List<Reservation> findByUserId(String userId) {
        return reservationRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public void cancelReservation(Long id, String requestingUserId) {
        if (requestingUserId == null || requestingUserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié.");
        }

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable."));

        if (!reservation.getUserId().equals(requestingUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous ne pouvez pas annuler la réservation d'un autre utilisateur.");
        }

        // Restore seat count
        Event event = eventRepository.findById(reservation.getEvent().getId())
                .orElseThrow(() -> new EventNotFoundException(reservation.getEvent().getId()));
        event.setSeat(event.getSeat() + 1);
        eventRepository.save(event);

        reservationRepository.deleteById(id);
    }
}
