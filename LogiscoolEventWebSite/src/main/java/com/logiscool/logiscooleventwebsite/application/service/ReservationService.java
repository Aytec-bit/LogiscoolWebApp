package com.logiscool.logiscooleventwebsite.application.service;

import com.logiscool.logiscooleventwebsite.domain.exception.EventNotFoundException;
import com.logiscool.logiscooleventwebsite.domain.model.Event;
import com.logiscool.logiscooleventwebsite.domain.model.Reservation;
import com.logiscool.logiscooleventwebsite.domain.port.in.ReservationUseCase;
import com.logiscool.logiscooleventwebsite.domain.port.out.EventRepository;
import com.logiscool.logiscooleventwebsite.domain.port.out.ReservationRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        // Vérifier s'il reste des places
        if (event.getSeat() <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet événement est complet.");
        }

        // Vérifier si l'utilisateur a déjà réservé cet événement
        if (reservationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous avez déjà réservé cet événement.");
        }

        // Décrémenter le nombre de places
        event.setSeat(event.getSeat() - 1);
        eventRepository.save(event);

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
    @Transactional
    public void cancelReservation(Long id, String requestingUserId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable."));

        if (!reservation.getUserId().equals(requestingUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez pas annuler la réservation d'un autre utilisateur.");
        }

        // Ré-incrémenter le nombre de places
        Event event = eventRepository.findById(reservation.getEvent().getId())
                .orElseThrow(() -> new EventNotFoundException(reservation.getEvent().getId()));
        event.setSeat(event.getSeat() + 1);
        eventRepository.save(event);

        reservationRepository.deleteById(id);
    }
}
