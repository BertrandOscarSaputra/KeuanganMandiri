package com.example.KeuanganMandiri.service;

import com.example.KeuanganMandiri.dto.product.ProductRequest;
import com.example.KeuanganMandiri.exception.ResourceNotFoundException;
import com.example.KeuanganMandiri.model.Product;
import com.example.KeuanganMandiri.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepo;

    public ProductService(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    public Product create(Long userId, ProductRequest request) {
        Product p = new Product();
        p.setUserId(userId);
        p.setName(request.getName());
        p.setStock(request.getStock());
        p.setPrice(request.getPrice());
        return productRepo.save(p);
    }

    public List<Product> getByUserId(Long userId) {
        return productRepo.findByUserId(userId);
    }

    public Product getById(Long userId, Long id) {
        return productRepo.findById(id)
                .filter(p -> p.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Produk", id));
    }

    public Product update(Long userId, Long id, ProductRequest request) {
        Product p = productRepo.findById(id)
                .filter(prod -> prod.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Produk", id));

        p.setName(request.getName());
        p.setStock(request.getStock());
        p.setPrice(request.getPrice());
        return productRepo.save(p);
    }

    public void delete(Long userId, Long id) {
        Product p = productRepo.findById(id)
                .filter(prod -> prod.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Produk", id));
        productRepo.delete(p);
    }

    public List<Product> searchByName(Long userId, String name) {
        return productRepo.findByUserIdAndNameContainingIgnoreCase(userId, name);
    }
}
