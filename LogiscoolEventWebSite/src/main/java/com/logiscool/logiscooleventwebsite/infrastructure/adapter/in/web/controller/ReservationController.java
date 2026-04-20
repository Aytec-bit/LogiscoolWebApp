package com.logiscool.logiscooleventwebsite.infrastructure.adapter.in.web.controller;

import com.logiscool.logiscooleventwebsite.application.dto.ReservationRequestDTO;
import com.logiscool.logiscooleventwebsite.application.dto.ReservationResponseDTO;
import com.logiscool.logiscooleventwebsite.application.mapper.ReservationApplicationMapper;
import com.logiscool.logiscooleventwebsite.domain.port.in.ReservationUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationUseCase reservationUseCase;

    public ReservationController(ReservationUseCase reservationUseCase) {
        this.reservationUseCase = reservationUseCase;
    }

    @PostMapping
    public ResponseEntity<ReservationResponseDTO> createReservation(
            @RequestBody ReservationRequestDTO dto,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        ReservationResponseDTO response = ReservationApplicationMapper.toResponseDTO(
                reservationUseCase.createReservation(userId, dto.getEventId())
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReservationResponseDTO>> getMyReservations(
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        List<ReservationResponseDTO> reservations = reservationUseCase.findByUserId(userId).stream()
                .map(ReservationApplicationMapper::toResponseDTO)
                .toList();
        return ResponseEntity.ok(reservations);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
        reservationUseCase.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
