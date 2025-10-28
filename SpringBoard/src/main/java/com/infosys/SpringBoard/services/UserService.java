package com.infosys.SpringBoard.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.infosys.SpringBoard.entity.User;
import com.infosys.SpringBoard.repository.UserRepo;

@Service
public class UserService {
    
    @Autowired
    private UserRepo userRepo;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User registerUser(User user) {
        //hashing the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    public boolean loginUser(String email, String password) {
        Optional<User> userOptional = userRepo.findByEmail(email);

        if(userOptional.isPresent()) {
            User user = userOptional.get();

            return passwordEncoder.matches(password, user.getPassword());
        }

        return false;
    }

    public Optional<User> findById(Long id) {
        return userRepo.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

}
