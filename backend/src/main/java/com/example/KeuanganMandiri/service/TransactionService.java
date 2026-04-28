package com.example.KeuanganMandiri.service;

import com.example.KeuanganMandiri.dto.transaction.TransactionRequest;
import com.example.KeuanganMandiri.dto.transaction.TransactionResponse;
import com.example.KeuanganMandiri.exception.ResourceNotFoundException;
import com.example.KeuanganMandiri.model.Category;
import com.example.KeuanganMandiri.model.Transaction;
import com.example.KeuanganMandiri.repository.CategoryRepository;
import com.example.KeuanganMandiri.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepo;
    private final CategoryRepository categoryRepo;

    public TransactionService(TransactionRepository transactionRepo, CategoryRepository categoryRepo) {
        this.transactionRepo = transactionRepo;
        this.categoryRepo = categoryRepo;
    }

    public TransactionResponse create(Long userId, TransactionRequest request) {
        Transaction t = new Transaction();
        t.setUserId(userId);
        t.setType(request.getType());
        t.setCategoryId(request.getCategoryId());
        t.setAmount(request.getAmount());
        t.setDescription(request.getDescription());
        t.setDate(request.getDate());

        t = transactionRepo.save(t);
        return toResponse(t);
    }

    public List<TransactionResponse> getByUserId(Long userId) {
        return transactionRepo.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponse getById(Long userId, Long id) {
        Transaction t = transactionRepo.findById(id)
                .filter(tx -> tx.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaksi", id));
        return toResponse(t);
    }

    public TransactionResponse update(Long userId, Long id, TransactionRequest request) {
        Transaction t = transactionRepo.findById(id)
                .filter(tx -> tx.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaksi", id));

        t.setType(request.getType());
        t.setCategoryId(request.getCategoryId());
        t.setAmount(request.getAmount());
        t.setDescription(request.getDescription());
        t.setDate(request.getDate());

        t = transactionRepo.save(t);
        return toResponse(t);
    }

    public void delete(Long userId, Long id) {
        Transaction t = transactionRepo.findById(id)
                .filter(tx -> tx.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaksi", id));
        transactionRepo.delete(t);
    }

    public BigDecimal getTotalIncome(Long userId) {
        return transactionRepo.getTotalIncome(userId);
    }

    public BigDecimal getTotalExpense(Long userId) {
        return transactionRepo.getTotalExpense(userId);
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepo.findByUserId(userId);
    }

    private TransactionResponse toResponse(Transaction t) {
        TransactionResponse resp = new TransactionResponse();
        resp.setId(t.getId());
        resp.setType(t.getType());
        resp.setCategoryId(t.getCategoryId());
        resp.setAmount(t.getAmount());
        resp.setDescription(t.getDescription());
        resp.setDate(t.getDate());
        resp.setCreatedAt(t.getCreatedAt());

        if (t.getCategoryId() != null) {
            categoryRepo.findById(t.getCategoryId())
                    .ifPresent(cat -> resp.setCategoryName(cat.getName()));
        }

        return resp;
    }
}