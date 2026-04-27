package com.example.KeuanganMandiri.service;

import com.example.KeuanganMandiri.dto.category.CategoryRequest;
import com.example.KeuanganMandiri.exception.ResourceNotFoundException;
import com.example.KeuanganMandiri.model.Category;
import com.example.KeuanganMandiri.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepo;

    public CategoryService(CategoryRepository categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    public Category create(Long userId, CategoryRequest request) {
        Category c = new Category();
        c.setUserId(userId);
        c.setName(request.getName());
        c.setType(request.getType());
        return categoryRepo.save(c);
    }

    public List<Category> getByUserId(Long userId) {
        return categoryRepo.findByUserId(userId);
    }

    public List<Category> getByUserIdAndType(Long userId, String type) {
        return categoryRepo.findByUserIdAndType(userId, type);
    }

    public Category update(Long userId, Long id, CategoryRequest request) {
        Category c = categoryRepo.findById(id)
                .filter(cat -> cat.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Kategori", id));

        c.setName(request.getName());
        c.setType(request.getType());
        return categoryRepo.save(c);
    }

    public void delete(Long userId, Long id) {
        Category c = categoryRepo.findById(id)
                .filter(cat -> cat.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Kategori", id));
        categoryRepo.delete(c);
    }
}
