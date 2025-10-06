package com.infosys.SpringBoard.services;

import java.util.List;
import java.util.Optional;

// Removed unnecessary import for BCryptPasswordEncoder
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.SpringBoard.entity.Admin;
import com.infosys.SpringBoard.entity.Complains;
import com.infosys.SpringBoard.repository.AdminRepository;
import com.infosys.SpringBoard.repository.ComplainRepository;

@Service
public class AdminService {
    
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ComplainRepository complainRepository;

    // Removed: private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Business Logic: Authenticate Admin login using plain text comparison.
     * @param email The admin's email.
     * @param password The admin's password (plain text).
     * @return true if credentials are valid, false otherwise.
     */
    public boolean loginUser(String email, String password) {
        Optional<Admin> adminOptional = adminRepository.findByEmail(email);

        if(adminOptional.isPresent()) {
            Admin admin = adminOptional.get();

            // FIX 1: Direct comparison since passwords are NOT encrypted
            // FIX 2: Added .trim() to eliminate invisible spaces from the database, which was a common cause of your previous error.
            return admin.getPassword().trim().equals(password);
        }

        // FIX 3 (CRITICAL BUG FIX): Must return false if the user is NOT present.
        return false; 
    }

    public List<Complains> getAllComplaints() {
        return complainRepository.findAll();
    }

    public Optional<Complains> updateComplainStatus(int complainId, String newStatus) {
        Optional<Complains> complainOptional = complainRepository.findById(complainId);
        
        if (complainOptional.isPresent()) {
            Complains complain = complainOptional.get();
            // Simple Status Validation
            if (newStatus.equals("Pending") || newStatus.equals("Resolved") || newStatus.equals("In Progress")) {
                complain.setStatus(newStatus);
                return Optional.of(complainRepository.save(complain));
            } else {
                return Optional.empty(); 
            }
        }
        return Optional.empty();
    }
}