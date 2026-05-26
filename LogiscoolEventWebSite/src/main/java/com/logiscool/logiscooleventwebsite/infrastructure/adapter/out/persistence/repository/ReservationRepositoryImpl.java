package com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.repository;

import com.logiscool.logiscooleventwebsite.domain.model.Reservation;
import com.logiscool.logiscooleventwebsite.domain.port.out.ReservationRepository;
import com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.mapper.ReservationPersistenceMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ReservationRepositoryImpl implements ReservationRepository {
    private final ReservationJpaRepository reservationJpaRepository;

    public ReservationRepositoryImpl(ReservationJpaRepository reservationJpaRepository) {
        this.reservationJpaRepository = reservationJpaRepository;
    }

    @Override
    public List<Reservation> findAll() {
        return reservationJpaRepository.findAll().stream()
                .map(ReservationPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Reservation> findById(Long id) {
        return reservationJpaRepository.findById(id)
                .map(ReservationPersistenceMapper::toDomain);
    }

    @Override
    public Reservation save(Reservation reservation) {
        return ReservationPersistenceMapper.toDomain(
                reservationJpaRepository.save(ReservationPersistenceMapper.toJpaEntity(reservation))
        );
    }

    @Override
    public void deleteById(Long id) {
        reservationJpaRepository.deleteById(id);
    }

    @Override
    public List<Reservation> findByUserId(String userId) {
        return reservationJpaRepository.findByUserId(userId).stream()
                .map(ReservationPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsByUserIdAndEventId(String userId, Long eventId) {
        return reservationJpaRepository.existsByUserIdAndEventEventId(userId, eventId);
    }
}
