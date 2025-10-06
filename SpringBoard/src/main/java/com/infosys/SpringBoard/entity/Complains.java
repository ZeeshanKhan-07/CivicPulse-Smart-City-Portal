package com.infosys.SpringBoard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Complains {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int complainId;

    // User details fetched from the User entity upon submission
    private int userId;
    private String firstName;
    private String userEmail; 

    private String title;
    private String category;
    private String description;
    private String location;

    private String status = "Pending"; // Default status

    private String imagePath; 

}