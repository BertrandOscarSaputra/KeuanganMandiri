package com.example.KeuanganMandiri.controller;

import com.example.KeuanganMandiri.dto.category.CategoryRequest;
import com.example.KeuanganMandiri.model.Category;
import com.example.KeuanganMandiri.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<Category> create(Authentication auth,
                                            @Valid @RequestBody CategoryRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAll(Authentication auth,
                                                  @RequestParam(required = false) String type) {
        Long userId = (Long) auth.getPrincipal();
        if (type != null) {
            return ResponseEntity.ok(categoryService.getByUserIdAndType(userId, type));
        }
        return ResponseEntity.ok(categoryService.getByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(Authentication auth, @PathVariable Long id,
                                            @Valid @RequestBody CategoryRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(categoryService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        categoryService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
