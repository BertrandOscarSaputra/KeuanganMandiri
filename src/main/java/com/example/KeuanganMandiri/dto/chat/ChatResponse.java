package com.example.KeuanganMandiri.dto.chat;

import java.time.LocalDateTime;

public class ChatResponse {

    private Long id;
    private String message;
    private String role;
    private LocalDateTime createdAt;

    public ChatResponse() {}

    public ChatResponse(Long id, String message, String role, LocalDateTime createdAt) {
        this.id = id;
        this.message = message;
        this.role = role;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
