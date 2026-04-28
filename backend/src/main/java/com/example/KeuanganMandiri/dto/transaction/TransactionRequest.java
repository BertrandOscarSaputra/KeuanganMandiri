package com.example.KeuanganMandiri.dto.transaction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionRequest {

    @NotBlank(message = "Tipe transaksi wajib diisi (income/expense)")
    @Pattern(regexp = "^(income|expense)$", message = "Tipe harus 'income' atau 'expense'")
    private String type;

    private Long categoryId;

    @NotNull(message = "Jumlah wajib diisi")
    @Positive(message = "Jumlah harus lebih dari 0")
    private BigDecimal amount;

    private String description;

    private LocalDate date;

    public TransactionRequest() {}

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
