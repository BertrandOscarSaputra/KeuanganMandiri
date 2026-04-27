package com.example.KeuanganMandiri.controller;

import com.example.KeuanganMandiri.dto.chat.ChatRequest;
import com.example.KeuanganMandiri.dto.chat.ChatResponse;
import com.example.KeuanganMandiri.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(Authentication auth,
                                              @Valid @RequestBody ChatRequest request) {
        Long userId = (Long) auth.getPrincipal();
        ChatResponse response = chatService.chat(userId, request.getMessage());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat/history")
    public ResponseEntity<List<ChatResponse>> chatHistory(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(chatService.getChatHistory(userId));
    }

    @PostMapping("/recommendation")
    public ResponseEntity<Map<String, String>> recommendation(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String result = chatService.getRecommendation(userId);
        return ResponseEntity.ok(Map.of("recommendation", result));
    }

    @PostMapping("/analysis")
    public ResponseEntity<Map<String, String>> analysis(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String result = chatService.getAnalysis(userId);
        return ResponseEntity.ok(Map.of("analysis", result));
    }
}