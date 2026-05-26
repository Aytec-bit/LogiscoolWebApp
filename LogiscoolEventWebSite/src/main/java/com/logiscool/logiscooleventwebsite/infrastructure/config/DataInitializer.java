package com.logiscool.logiscooleventwebsite.infrastructure.config;

import com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.entity.EventJpaEntity;
import com.logiscool.logiscooleventwebsite.infrastructure.adapter.out.persistence.repository.EventJpaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EventJpaRepository eventJpaRepository;

    public DataInitializer(EventJpaRepository eventJpaRepository) {
        this.eventJpaRepository = eventJpaRepository;
    }

    @Override
    public void run(String... args) {
        if (eventJpaRepository.count() > 0) {
            return; // Des données existent déjà — on ne réinsère pas
        }

        List<EventJpaEntity> events = List.of(

            event("Atelier Scratch Junior",
                  "Initiation à la programmation visuelle avec Scratch. Crée tes premiers jeux et animations !",
                  "Salle A101", "Scratch", "6-8 ans", 15,
                  LocalDateTime.of(2027, 6, 5, 10, 0),
                  LocalTime.of(1, 30), new BigDecimal("12.00")),

            event("Python pour débutants",
                  "Découvre les bases du langage Python à travers des exercices ludiques et des mini-projets.",
                  "Salle B202", "Python", "12-14 ans", 12,
                  LocalDateTime.of(2027, 6, 12, 14, 0),
                  LocalTime.of(2, 0), new BigDecimal("15.00")),

            event("Robotique & Arduino",
                  "Construis et programme ton propre robot avec une carte Arduino. Électronique et code au programme !",
                  "Labo Tech", "Robotique", "12-14 ans", 10,
                  LocalDateTime.of(2027, 6, 19, 9, 0),
                  LocalTime.of(3, 0), new BigDecimal("20.00")),

            event("Création de sites Web",
                  "Apprends les bases du HTML, CSS et JavaScript pour créer ta propre page web personnalisée.",
                  "Salle C305", "Web", "15-17 ans", 14,
                  LocalDateTime.of(2027, 7, 3, 10, 0),
                  LocalTime.of(2, 0), new BigDecimal("15.00")),

            event("Intelligence Artificielle — Introduction",
                  "Comprendre ce qu'est l'IA, comment ça fonctionne, et créer un premier modèle de classification simple.",
                  "Salle B202", "IA", "15-17 ans", 12,
                  LocalDateTime.of(2027, 7, 10, 14, 0),
                  LocalTime.of(2, 30), new BigDecimal("18.00")),

            event("Scratch Avancé — Jeux vidéo",
                  "Tu connais déjà Scratch ? Passe au niveau supérieur et crée un vrai jeu vidéo avec plusieurs niveaux.",
                  "Salle A101", "Scratch", "9-11 ans", 15,
                  LocalDateTime.of(2027, 7, 17, 10, 0),
                  LocalTime.of(1, 30), new BigDecimal("12.00")),

            event("Python — Jeux et graphismes",
                  "Utilise la bibliothèque Pygame pour créer des jeux 2D en Python. Sprites, collisions et scores !",
                  "Salle C305", "Python", "12-14 ans", 12,
                  LocalDateTime.of(2027, 8, 7, 14, 0),
                  LocalTime.of(2, 0), new BigDecimal("15.00")),

            event("Atelier Découverte Numérique",
                  "Une journée pour explorer l'informatique : algorithmes, réseaux, sécurité et objets connectés.",
                  "Grande Salle", "Numérique", "Tous âges", 25,
                  LocalDateTime.of(2027, 8, 21, 9, 30),
                  LocalTime.of(4, 0), null),

            event("Robotique Avancée — Capteurs",
                  "Programme des comportements autonomes pour ton robot : capteurs de distance, lumière et son.",
                  "Labo Tech", "Robotique", "15-17 ans", 8,
                  LocalDateTime.of(2027, 9, 4, 10, 0),
                  LocalTime.of(3, 0), new BigDecimal("22.00")),

            event("Développement Web Full-Stack",
                  "Front-end et back-end réunis : crée une application web complète avec HTML/CSS/JS et une API REST.",
                  "Salle C305", "Web", "15-17 ans", 10,
                  LocalDateTime.of(2027, 9, 18, 14, 0),
                  LocalTime.of(3, 0), new BigDecimal("25.00"))
        );

        eventJpaRepository.saveAll(events);
        System.out.println("[DataInitializer] 10 événements de démonstration insérés.");
    }

    private EventJpaEntity event(String title, String description, String location,
                                  String type, String targetAge, int seat,
                                  LocalDateTime date, LocalTime lengthTime, BigDecimal price) {
        EventJpaEntity e = new EventJpaEntity();
        e.setTitle(title);
        e.setDescription(description);
        e.setLocation(location);
        e.setType(type);
        e.setTargetAge(targetAge);
        e.setSeat(seat);
        e.setDate(date);
        e.setLengthTime(lengthTime);
        e.setPrice(price);
        return e;
    }
}
