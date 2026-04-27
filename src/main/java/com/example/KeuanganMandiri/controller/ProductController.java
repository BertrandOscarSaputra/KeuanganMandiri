package com.example.KeuanganMandiri.controller;

import com.example.KeuanganMandiri.dto.product.ProductRequest;
import com.example.KeuanganMandiri.model.Product;
import com.example.KeuanganMandiri.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<Product> create(Authentication auth,
                                           @Valid @RequestBody ProductRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAll(Authentication auth,
                                                 @RequestParam(required = false) String search) {
        Long userId = (Long) auth.getPrincipal();
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(productService.searchByName(userId, search));
        }
        return ResponseEntity.ok(productService.getByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(productService.getById(userId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(Authentication auth, @PathVariable Long id,
                                           @Valid @RequestBody ProductRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(productService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        productService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
