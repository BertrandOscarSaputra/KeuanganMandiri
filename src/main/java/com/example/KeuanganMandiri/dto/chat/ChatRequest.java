package com.example.KeuanganMandiri.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatRequest {

    @NotNull(message = "User ID wajib diisi")
    private Long userId;

    @NotBlank(message = "Pesan tidak boleh kosong")
    private String message;

    public ChatRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
