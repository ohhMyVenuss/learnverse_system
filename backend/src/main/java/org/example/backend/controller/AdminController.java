package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.dashboard.AdminDashboardResponse;
import org.example.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardResponse> getDashboardStats() {
        System.out.println("dang mo dashboard cua admin");
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
}

