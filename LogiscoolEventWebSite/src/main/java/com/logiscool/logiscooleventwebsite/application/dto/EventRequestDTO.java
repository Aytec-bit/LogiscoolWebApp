package com.logiscool.logiscooleventwebsite.application.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRequestDTO {

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotBlank(message = "Le lieu est obligatoire")
    private String location;

    private String type;
    private String targetAge;

    @NotNull(message = "Le nombre de places est obligatoire")
    @Positive(message = "Le nombre de places doit être positif")
    private Integer seat;

    @NotNull(message = "La date est obligatoire")
    @Future(message = "La date de l'événement doit être dans le futur")
    private LocalDateTime date;

    @NotNull(message = "La durée est obligatoire")
    private LocalTime lengthTime;

    @DecimalMin(value = "0.00", message = "Le prix ne peut pas être négatif")
    private BigDecimal price;
}
