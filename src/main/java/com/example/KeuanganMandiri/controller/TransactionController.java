package com.example.KeuanganMandiri.controller;

import com.example.KeuanganMandiri.dto.transaction.TransactionRequest;
import com.example.KeuanganMandiri.dto.transaction.TransactionResponse;
import com.example.KeuanganMandiri.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(Authentication auth,
                                                       @Valid @RequestBody TransactionRequest request) {
        Long userId = (Long) auth.getPrincipal();
        TransactionResponse response = transactionService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAll(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(transactionService.getByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getById(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(transactionService.getById(userId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(Authentication auth, @PathVariable Long id,
                                                       @Valid @RequestBody TransactionRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(transactionService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        transactionService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}