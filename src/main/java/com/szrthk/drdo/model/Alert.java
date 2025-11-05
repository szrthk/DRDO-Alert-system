package com.szrthk.drdo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Setter;
import jakarta.persistence.Id;

import java.time.Instant;

@Entity
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(nullable = false, length = 16)
    private String severity; // LOW | MEDIUM | HIGH | CRITICAL

    @Setter
    @Column(nullable = false, length = 255)
    private String location;

    @Column(nullable = false, length = 2048)
    private String description;

    @Setter
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();


    public Alert() {}
    public Alert(String severity, String location, String description) {
        this.severity = severity;
        this.location = location;
        this.description = description;
    }

    public Long getId() { return id; }
    public String getSeverity() { return severity; }

    public String getLocation() { return location; }

    public String getDescription() { return description; }

    public Instant getCreatedAt() { return createdAt; }
}
