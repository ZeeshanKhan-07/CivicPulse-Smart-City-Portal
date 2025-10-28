package com.infosys.SpringBoard.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.SpringBoard.entity.Admin;
import com.infosys.SpringBoard.entity.Complains;
import com.infosys.SpringBoard.entity.Department;
import com.infosys.SpringBoard.repository.AdminRepository;
import com.infosys.SpringBoard.repository.ComplainRepository;
import com.infosys.SpringBoard.repository.DepartmentRepo;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ComplainRepository complainRepository;

    @Autowired
    private DepartmentRepo departmentRepository;

    
    public boolean loginUser(String email, String password) {
        Optional<Admin> adminOptional = adminRepository.findByEmail(email);

        if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();
            // Direct comparison for plain text passwords, trimming spaces for safety.
            return admin.getPassword().trim().equals(password);
        }
        return false;
    }

    public List<Complains> getAllComplaints() {
        return complainRepository.findAll();
    }

    public Optional<Complains> updateComplainStatus(Long complainId, String newStatus, String message) {

        Optional<Complains> complainOptional = complainRepository.findById(complainId);

        if (complainOptional.isPresent()) {
            Complains complain = complainOptional.get();

            try {
                Complains.Status statusEnum = Complains.Status.valueOf(newStatus.toUpperCase());

                complain.setStatus(statusEnum); // Now passing the correct Enum type
                complain.setMessage(message);

                return Optional.of(complainRepository.save(complain));

            } catch (IllegalArgumentException e) {
                // Handle case where the provided newStatus String doesn't match any Enum
                // constant
                // You might want to log this or return an empty Optional/throw a specific
                // exception
                System.err.println("Invalid status value provided: " + newStatus);
                return Optional.empty();
            }
        } else {
            return Optional.empty();
        }
    }

    public Optional<Complains> assignComplaintToDepartment(Long complainId, Long departmentId) {

        Optional<Complains> complainOpt = complainRepository.findById(complainId);
        Optional<Department> deptOpt = departmentRepository.findById(departmentId);

        if (complainOpt.isPresent() && deptOpt.isPresent()) {
            Complains complain = complainOpt.get();
            complain.setDepartment(deptOpt.get());

            // Optionally, set status to IN_PROGRESS when assigned
            complain.setStatus(Complains.Status.IN_PROGRESS);

            return Optional.of(complainRepository.save(complain));
        }

        return Optional.empty();
    }
}