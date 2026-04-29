package com.example.KeuanganMandiri.controller;

import com.example.KeuanganMandiri.dto.auth.ProfilePictureRequest;
import com.example.KeuanganMandiri.model.User;
import com.example.KeuanganMandiri.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PutMapping("/profile-picture")
    public ResponseEntity<?> updateProfilePicture(Authentication auth, @RequestBody ProfilePictureRequest request) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setProfilePicture(request.getBase64Image());
        userRepository.save(user);
        
        return ResponseEntity.ok().build();
    }
}
