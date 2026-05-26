package com.logiscool.logiscooleventwebsite.infrastructure.adapter.in.web.exception;

import com.logiscool.logiscooleventwebsite.domain.exception.EventNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Gestionnaire global des exceptions — renvoie des réponses JSON cohérentes.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 404 — événement introuvable */
    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEventNotFound(EventNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", ex.getMessage()));
    }

    /** 4xx/5xx levés par ResponseStatusException (service métier) */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException ex) {
        String message = ex.getReason() != null ? ex.getReason() : "Une erreur est survenue.";
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("message", message));
    }

    /** 400 — erreurs de validation @Valid */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Données invalides.", "errors", errors));
    }

    /** 500 — erreur inattendue */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Une erreur interne est survenue."));
    }
}
