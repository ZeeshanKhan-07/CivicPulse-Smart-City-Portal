package com.infosys.SpringBoard.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.SpringBoard.dto.DepartmentComplaintCountDTO;
import com.infosys.SpringBoard.entity.Admin;
import com.infosys.SpringBoard.entity.Complains;
import com.infosys.SpringBoard.services.AdminService;
import com.infosys.SpringBoard.services.ComplainService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ComplainService complainService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Admin admin) {
        if (adminService.loginUser(admin.getEmail(), admin.getPassword())) {
            // Success: Return 200 OK
            return new ResponseEntity<>("Login successful", HttpStatus.OK);
        } else {
            // Failure: Return 401 Unauthorized (Standard for authentication failure)
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/complaints")
    public List<Complains> getAllComplaints() {
        return adminService.getAllComplaints();
    }

    /**
     * Endpoint to update the status of a specific complaint.
     * Request body expects: {"status": "Resolved"}
     */
    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateComplainStatus(
            @PathVariable("id") Long complainId,
            @RequestBody Map<String, String> statusUpdate) {

        String newStatus = statusUpdate.get("status");
        String message = statusUpdate.get("message");

        if (newStatus == null || newStatus.trim().isEmpty()) {
            return new ResponseEntity<>("Status field is required.", HttpStatus.BAD_REQUEST);
        }

        // Delegation to the business logic layer
        return adminService.updateComplainStatus(complainId, newStatus, message)
                .<ResponseEntity<?>>map(updatedComplain -> new ResponseEntity<>(updatedComplain, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>("Complaint not found or status invalid.", HttpStatus.NOT_FOUND));
    }

    @PutMapping("/complaints/{id}/assign-department")
    public ResponseEntity<?> assignComplaintToDepartment(
            @PathVariable("id") Long complainId,
            @RequestBody Map<String, Long> requestBody) {

        Long departmentId = requestBody.get("departmentId");
        // NEW: Get the timeline in days
        Long timelineDays = requestBody.get("timelineDays");

        if (departmentId == null || timelineDays == null) {
            return new ResponseEntity<>("departmentId and timelineDays are required", HttpStatus.BAD_REQUEST);
        }

        // Pass the new parameter to the service
        return adminService.assignComplaintToDepartment(complainId, departmentId, timelineDays)
                .<ResponseEntity<?>>map(updatedComplain -> new ResponseEntity<>(updatedComplain, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>("Complaint or Department not found.", HttpStatus.NOT_FOUND));
    }

    @GetMapping("/complaints/department-count")
    public ResponseEntity<List<DepartmentComplaintCountDTO>> getComplaintCountByDepartment() {
        List<DepartmentComplaintCountDTO> data = complainService.getComplaintCountByDepartment();
        return ResponseEntity.ok(data);
    }
}