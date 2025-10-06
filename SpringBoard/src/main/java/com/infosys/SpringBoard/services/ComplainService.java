package com.infosys.SpringBoard.services;

import com.infosys.SpringBoard.entity.Complains;
import com.infosys.SpringBoard.entity.User;
import com.infosys.SpringBoard.repository.ComplainRepository;

import org.springframework.beans.factory.annotation.Autowired;
// ... (other imports)
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ComplainService {

    @Autowired
    private ComplainRepository complainRepository;
    
    @Autowired
    private UserService userService;

    // Read the file upload directory from application.properties
    @Value("${file.upload-dir}")
    private String uploadDir;

    public Complains submitNewComplain(int userId, String title, String category, String description, String location, MultipartFile imageFile) throws IOException {
        
        Optional<User> userOptional = userService.findById(userId);

        if (!userOptional.isPresent()) {
            throw new IllegalArgumentException("User with ID " + userId + " not found.");
        }
        User user = userOptional.get();

        Complains newComplain = new Complains();
        
        // --- FILE STORAGE LOGIC ---
        if (imageFile != null && !imageFile.isEmpty()) {
            // 1. Generate a unique file name
            String originalFileName = imageFile.getOriginalFilename();
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            
            // 2. Define the path where the file will be saved
            Path copyLocation = Paths.get(uploadDir + File.separator + uniqueFileName);
            
            // 3. Ensure the directory exists
            Files.createDirectories(copyLocation.getParent());
            
            // 4. Save the file to the local file system
            Files.copy(imageFile.getInputStream(), copyLocation);
            
            // 5. Store only the unique file name/path in the database
            newComplain.setImagePath(uniqueFileName);
        }
        
        // ... (Existing complaint population logic) ...
        newComplain.setUserId(userId);
        newComplain.setFirstName(user.getFirstName());
        newComplain.setUserEmail(user.getEmail());
        newComplain.setTitle(title);
        newComplain.setCategory(category);
        newComplain.setDescription(description);
        newComplain.setLocation(location);
        
        return complainRepository.save(newComplain);
    }

     public List<Complains> getComplaintsByUserId(int userId) {
        // Delegates the query to the repository
        return complainRepository.findByUserId(userId); 
    }
}