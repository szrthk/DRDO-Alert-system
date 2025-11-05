package com.szrthk.drdo.controller;

import com.szrthk.drdo.dto.CreateAlertRequest;
import com.szrthk.drdo.model.Alert;
import com.szrthk.drdo.repo.AlertRepositery; // keep your current name
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
@RestController
@RequestMapping("/api/alerts")
public class AlertController {
    private final AlertRepositery repo;

    public AlertController(AlertRepositery repo) { 
        this.repo = repo; 
    }

    @GetMapping("/health") 
    public String health() { 
        return "OK"; 
    }

    @PostMapping
    public ResponseEntity<Alert> create(@Valid @RequestBody CreateAlertRequest req) {
        Alert saved = repo.save(new Alert(req.getSeverity(), req.getLocation(), req.getDescription()));
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @GetMapping
    public List<Alert> all(@RequestParam(required = false) String severity) {
        if (severity != null) return repo.findBySeverityOrderByCreatedAtDesc(severity);
        return repo.findAll().stream().sorted((a,b)->b.getCreatedAt().compareTo(a.getCreatedAt())).toList();
    }

    @SuppressWarnings("null")
    @GetMapping("/{id}")
    public ResponseEntity<Alert> byId(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @SuppressWarnings("null")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

