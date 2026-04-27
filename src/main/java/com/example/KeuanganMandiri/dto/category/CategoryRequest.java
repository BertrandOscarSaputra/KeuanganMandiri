package com.example.KeuanganMandiri.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CategoryRequest {

    @NotBlank(message = "Nama kategori wajib diisi")
    private String name;

    @NotBlank(message = "Tipe kategori wajib diisi (income/expense)")
    @Pattern(regexp = "^(income|expense)$", message = "Tipe harus 'income' atau 'expense'")
    private String type;

    public CategoryRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
