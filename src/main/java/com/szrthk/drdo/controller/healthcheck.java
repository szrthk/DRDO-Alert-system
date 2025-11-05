package com.szrthk.drdo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class healthcheck {
    @GetMapping("hc")
    public Map<String, Object>health(){
        return Map.of(
                "status", "UP",
                "Service","DRDO Threat Alert API",
                "timestamp", Instant.now().toString()
        );
    }
}
