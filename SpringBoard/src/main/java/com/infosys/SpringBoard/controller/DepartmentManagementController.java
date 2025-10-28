package com.infosys.SpringBoard.controller;

import com.infosys.SpringBoard.dto.DepartmentLoginRequest;
import com.infosys.SpringBoard.entity.Complains;
import com.infosys.SpringBoard.entity.Department;
import com.infosys.SpringBoard.entity.Worker;
import com.infosys.SpringBoard.repository.ComplainRepository;
import com.infosys.SpringBoard.repository.DepartmentRepo;
import com.infosys.SpringBoard.services.ComplainService;
import com.infosys.SpringBoard.services.DepartmentService;
import com.infosys.SpringBoard.services.WorkerService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional; // Required for Optional handling

@RestController
@RequestMapping("/api/dept-manager")
public class DepartmentManagementController {

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private WorkerService workerService;

    @Autowired
    private ComplainService complaintService;

    @Autowired
    private ComplainRepository complainRepository;

    @Autowired
    private DepartmentRepo departmentRepository;

    @PostMapping("/login")
    public ResponseEntity<Long> login(@RequestBody DepartmentLoginRequest loginRequest) { // -> Working but returning
                                                                                          // the id i will fix it later
                                                                                          // on to return the name of
                                                                                          // the dept
        Optional<Department> deptOptional = departmentService.loginWithDetails(
                loginRequest.getDepartmentName(),
                loginRequest.getAdminEmail(), // <-- Corrected DTO Getter
                loginRequest.getPassword());

        if (deptOptional.isPresent()) {
            return new ResponseEntity<>(deptOptional.get().getId(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/{deptId}/workers") // -> Working but id is getting 100+
    public ResponseEntity<Worker> addWorker(@PathVariable Long deptId, @RequestBody Worker worker) {
        try {
            Worker newWorker = workerService.addWorker(deptId, worker);
            return new ResponseEntity<>(newWorker, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{deptId}/workers") // -> working
    public List<Worker> getWorkersByDepartment(@PathVariable Long deptId) {
        return workerService.getWorkersByDepartmentId(deptId);
    }

    @GetMapping("/{deptId}/complaints") // -> working
    public List<Complains> getAssignedComplaints(@PathVariable Long deptId) {
        return complaintService.getComplaintsByDepartmentId(deptId);
    }

    @PutMapping("/complaints/{complaintId}/status") // -> working
    public ResponseEntity<Complains> updateStatus(
            @PathVariable Long complaintId,
            @RequestBody Map<String, String> updateDetails) {

        String newStatusStr = updateDetails.get("status");
        String message = updateDetails.get("message");

        if (newStatusStr == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        try {
            return complaintService.updateStatusAndMessage(complaintId, newStatusStr, message)
                    .map(updatedComplaint -> new ResponseEntity<>(updatedComplaint, HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/complaints/{complaintId}/complete")
    public ResponseEntity<?> completeTask(
            @PathVariable Long complaintId,
            @RequestParam("imageFile") MultipartFile imageFile,
            @RequestParam("message") String message,
            @RequestParam("workerIds") String workerIdsString) {

        if (imageFile == null || imageFile.isEmpty() || workerIdsString == null || message == null) {
            return new ResponseEntity<>("Missing required completion data (image, message, or workerIds).",
                    HttpStatus.BAD_REQUEST);
        }

        try {
            Optional<Complains> updatedComplaint = complaintService.completeTaskWithFile(
                    complaintId,
                    imageFile,
                    message,
                    workerIdsString);

            return updatedComplaint
                    .<ResponseEntity<?>>map(c -> new ResponseEntity<>(c, HttpStatus.OK))
                    .orElseGet(
                            () -> new ResponseEntity<>("Complaint or Worker assignment failed.", HttpStatus.NOT_FOUND));

        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            return new ResponseEntity<>("File storage failed on server: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/all-names")
    public ResponseEntity<List<Department>> getAllDepartments() {
        List<Department> departments = departmentService.getAllDepartments();

        return new ResponseEntity<>(departments, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        return departmentRepository.findById(id)
                .map(department -> new ResponseEntity<>(department, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/complaints/{complainId}/workers")
    public ResponseEntity<List<Worker>> getAssignedWorkersForComplaint(@PathVariable Long complainId) {

        List<Worker> workers = complaintService.getWorkersByComplaintId(complainId);

        if (workers.isEmpty()) {
            return ResponseEntity.ok(workers);
        }

        return ResponseEntity.ok(workers);
    }

}