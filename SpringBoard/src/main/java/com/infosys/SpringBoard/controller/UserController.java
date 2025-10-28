package com.infosys.SpringBoard.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.infosys.SpringBoard.entity.Complains;
import com.infosys.SpringBoard.entity.User;
import com.infosys.SpringBoard.services.ComplainService;
import com.infosys.SpringBoard.services.UserService;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ComplainService complainService;
    
    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody User user) {
        try {
            userService.registerUser(user);
            // Success: 201 Created
            return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Failure: 400 Bad Request (e.g., email already exists)
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        boolean success = userService.loginUser(user.getEmail(), user.getPassword());

        if (success) {
            // Success: Return 200 OK and User ID for tracking
            Optional<User> loggedInUser = userService.findByEmail(user.getEmail());
            // This response format helps the frontend easily get the ID.
            return new ResponseEntity<>("Login Successful UserID:" + loggedInUser.get().getId(), HttpStatus.OK);
        } else {
            // Failure: Return 401 Unauthorized (Standard for login failure)
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/complain/raise")
    public ResponseEntity<String> raiseComplain(
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        try {
            // Delegation to service layer for file storage and entity creation
            Complains savedComplain = complainService.submitNewComplain(userId, title, category, description, location, imageFile);
            // Success: 201 Created
            return new ResponseEntity<>("Complaint raised successfully. ID: " + savedComplain.getComplainId(), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // User not found: 404 Not Found
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IOException e) {
            // File system error: 500 Internal Server Error
            return new ResponseEntity<>("Error processing file: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/complaints/history/{userId}")
    public ResponseEntity<List<Complains>> getComplaintHistory(@PathVariable Long userId) {
        
        List<Complains> complaints = complainService.getComplaintsByUserId(userId);

        // Return 200 OK with the list (which may be empty)
        return new ResponseEntity<>(complaints, HttpStatus.OK);
    }
}