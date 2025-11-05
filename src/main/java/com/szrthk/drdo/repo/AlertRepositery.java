package com.szrthk.drdo.repo;

import com.szrthk.drdo.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepositery extends JpaRepository<Alert, Long> {
    List<Alert> findBySeverityOrderByCreatedAtDesc(String severity);
}
