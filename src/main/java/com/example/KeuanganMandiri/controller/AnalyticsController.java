package com.example.KeuanganMandiri.controller;

import com.example.KeuanganMandiri.dto.analytics.DashboardResponse;
import com.example.KeuanganMandiri.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> dashboard(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(analyticsService.getDashboard(userId));
    }
}
