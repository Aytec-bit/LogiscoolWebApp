package com.logiscool.logiscooleventwebsite.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequestDTO {

    @NotNull(message = "L'identifiant de l'événement est obligatoire")
    @Positive(message = "L'identifiant de l'événement doit être positif")
    private Long eventId;
}
