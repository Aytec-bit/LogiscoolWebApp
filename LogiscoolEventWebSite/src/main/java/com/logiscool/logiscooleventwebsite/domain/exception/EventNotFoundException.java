package com.logiscool.logiscooleventwebsite.domain.exception;

public class EventNotFoundException extends RuntimeException {
    public EventNotFoundException(Long id) {
        super("Événement introuvable (id : " + id + ").");
    }
}
