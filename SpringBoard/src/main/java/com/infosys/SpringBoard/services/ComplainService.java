package com.infosys.SpringBoard.services;

import com.infosys.SpringBoard.dto.DepartmentComplaintCountDTO;
import com.infosys.SpringBoard.entity.Complains;
import com.infosys.SpringBoard.entity.User;
import com.infosys.SpringBoard.entity.Department;
import com.infosys.SpringBoard.entity.Worker;
import com.infosys.SpringBoard.repository.ComplainRepository;
import com.infosys.SpringBoard.repository.DepartmentRepo;
import com.infosys.SpringBoard.repository.WorkerRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ComplainService {

    @Autowired
    private ComplainRepository complainRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private DepartmentRepo departmentRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // --- Helper for File Storage (Consolidated Logic) ---
    /** Helper to store the AFTER IMAGE file and return its unique name. */
    private String storeFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty.");
        }

        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.lastIndexOf(".") != -1) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String uniqueFileName = "after_" + UUID.randomUUID().toString() + fileExtension;
        Path copyLocation = Paths.get(uploadDir + File.separator + uniqueFileName).normalize();

        Files.createDirectories(copyLocation.getParent());
        Files.copy(file.getInputStream(), copyLocation);

        return uniqueFileName;
    }

    @Transactional
    public Complains submitNewComplain(Long userId, String title, String category, String description, String city, String location,
            MultipartFile imageFile) throws IOException {

        Optional<User> userOptional = userService.findById(userId);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User with ID " + userId + " not found.");
        }
        User user = userOptional.get();

        Complains newComplain = new Complains();

        // Logic to store BEFORE IMAGE (assuming unique naming)
        if (imageFile != null && !imageFile.isEmpty()) {
            String originalFileName = imageFile.getOriginalFilename();
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            Path copyLocation = Paths.get(uploadDir + File.separator + uniqueFileName).normalize();
            Files.createDirectories(copyLocation.getParent());
            Files.copy(imageFile.getInputStream(), copyLocation);
            newComplain.setBeforeImagePath(uniqueFileName);
        }

        newComplain.setUserId(userId);
        newComplain.setFirstName(user.getFirstName());
        newComplain.setUserEmail(user.getEmail());
        newComplain.setTitle(title);
        newComplain.setCategory(category);
        newComplain.setDescription(description);
        newComplain.setCity(city);
        newComplain.setLocation(location);
        newComplain.setDepartment(null);
        newComplain.setStatus(Complains.Status.PENDING);

        return complainRepository.save(newComplain);
    }

    @Transactional
    public Optional<Complains> assignDepartmentAndWorkers(Long complainId, Long departmentId, List<Long> workerIds) {
        return complainRepository.findById(complainId).flatMap(complaint -> {
            Optional<Department> departmentOpt = departmentRepository.findById(departmentId);
            if (departmentOpt.isEmpty()) {
                throw new IllegalArgumentException("Department with ID " + departmentId + " not found.");
            }
            complaint.setDepartment(departmentOpt.get());

            if (workerIds != null && !workerIds.isEmpty()) {
                List<Worker> workers = workerRepository.findAllById(workerIds);
                if (workers.size() != workerIds.size()) {
                    throw new IllegalArgumentException("One or more workers not found.");
                }

                // Check if workers belong to the assigned department
                boolean allMatch = workers.stream()
                        .allMatch(w -> w.getDepartment().getId() == departmentId); // Correct primitive comparison
                if (!allMatch) {
                    throw new IllegalArgumentException("One or more workers do not belong to the assigned department.");
                }

                complaint.setAssignedWorkers(workers);
                if (complaint.getStatus().equals(Complains.Status.PENDING)) {
                    complaint.setStatus(Complains.Status.IN_PROGRESS);
                }
            } else {
                complaint.setAssignedWorkers(null);
            }

            return Optional.of(complainRepository.save(complaint));
        });
    }

    @Transactional
    public Optional<Complains> updateStatusAndMessage(Long complainId, String newStatusStr, String message) {
        return complainRepository.findById(complainId).map(complaint -> {
            // ... (Status update logic remains the same) ...
            try {
                Complains.Status newStatus = Complains.Status.valueOf(newStatusStr.toUpperCase());
                complaint.setStatus(newStatus);
                complaint.setMessage(message);
                if (newStatus != Complains.Status.RESOLVED) {
                    complaint.setAfterImagePath(null);
                }
                return complainRepository.save(complaint);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status value: " + newStatusStr);
            }
        });
    }

    @Transactional
    public Optional<Complains> completeTaskWithFile(
            Long complainId,
            MultipartFile imageFile,
            String message,
            String workerIdsString) throws IOException {

        // 1. Store the AFTER IMAGE file (Error fixed by using dedicated helper)
        String afterImagePath = storeFile(imageFile);

        // 2. Convert workerIds String to List<Worker> objects (Error fixed by using
        // robust parsing)
        List<Long> workerIds = Arrays.stream(workerIdsString.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::valueOf)
                .toList();

        List<Worker> workers = workerRepository.findAllById(workerIds);

        // 3. Update Complaint entity
        return complainRepository.findById(complainId).map(complaint -> {

            // CRITICAL FIX: Ensure ALL fields are being set/updated for persistence
            complaint.setAfterImagePath(afterImagePath);
            complaint.setMessage(message);
            complaint.setStatus(Complains.Status.RESOLVED);
            complaint.setResolvedAt(java.time.LocalDateTime.now());
            // CRITICAL FIX: Set the Many-to-Many relationship using the correct field name
            complaint.setAssignedWorkers(workers);

            return complainRepository.save(complaint);
        });
    }

    public List<Complains> getComplaintsByUserId(Long userId) {

        return complainRepository.findComplaintsWithWorkersByUserId(userId);
    }

    public List<Department> getAllDepartments() {
        // Uses the standard findAll() method
        return departmentRepository.findAll();
    }

    public List<Complains> findComplaintsWithWorkersByUserId(Long userId) {
        return complainRepository.findComplaintsWithWorkersByUserId(userId);
    }

    public List<Complains> getComplaintsByDepartmentId(Long departmentId) {
        // This is fine as it doesn't involve the problematic user ID lookup
        return complainRepository.findByDepartmentId(departmentId);
    }

    public List<Worker> getWorkersByComplaintId(Long complainId) {
        Optional<Complains> complaintOpt = complainRepository.findByIdWithAssignedWorkers(complainId);

        // 2. If the complaint is found, return its assigned workers list.
        return complaintOpt
                .map(Complains::getAssignedWorkers) // Assuming your getter is getAssignedWorkers()
                .orElseGet(java.util.Collections::emptyList); // Return empty list if not found
    }

    public String sendFeedback(Long complainId, int rating, String feedbackMessage) {
        Optional<Complains> complaintOpt = complainRepository.findById(complainId);
        if (complaintOpt.isPresent()) {
            Complains complaint = complaintOpt.get();
            complaint.setRating(rating);
            complaint.setFeedback(feedbackMessage);
            complainRepository.save(complaint);
            return "Feedback submitted successfully.";
        } else {
            return "Complaint not found.";
        }
    }

    public Optional<String> getDepartmentNameByComplainId(Long complainId) {
        // findById will fetch the complaint, which should eagerly or lazily load the
        // Department.
        return complainRepository.findById(complainId)
                .map(Complains::getDepartment) // Get the Department object
                .map(Department::getName); // Get the name from the Department object
    }

    public Optional<LocalDate> getDeadlineDateByComplainId(Long complainId) {
        return complainRepository.findDeadlineDateByComplainId(complainId);
    }

    public String calculateCompletionTime(Complains complaint) {
        LocalDateTime deadline = null;
        LocalDateTime resolved = complaint.getResolvedAt();

        if (complaint.getDeadlineDate() != null) {
            // If deadline_date in DB is LocalDate, convert to LocalDateTime (start of day)
            deadline = complaint.getDeadlineDate().atStartOfDay();
        }

        if (resolved == null || deadline == null) {
            return "Completion time unavailable";
        }

        java.time.Duration duration = java.time.Duration.between(deadline, resolved);
        long hours = duration.toHours();
        long days = hours / 24;
        long remainingHours = hours % 24;

        if (duration.isNegative()) {
            return Math.abs(days) + "d " + Math.abs(remainingHours) + "h before deadline";
        } else if (duration.isZero()) {
            return " on the exact deadline day";
        } else {
            return days + "d " + remainingHours + "h after deadline";
        }
    }

    public Optional<Integer> getRatingByComplainId(Long complainId) {
        Integer rating = complainRepository.findRatingByComplainId(complainId);
        return Optional.ofNullable(rating);
    }

    public List<DepartmentComplaintCountDTO> getComplaintCountByDepartment() {
        return complainRepository.getComplaintCountByDepartment();
    }

}