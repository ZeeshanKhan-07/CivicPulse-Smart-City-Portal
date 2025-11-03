package com.infosys.SpringBoard.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
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

    public enum Status {
        PENDING, IN_PROGRESS, RESOLVED
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long complainId;

    // User details fetched from the User entity upon submission
    private long userId;
    private String firstName;
    private String userEmail; 

    private String title;
    private String category;
    private String description;
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String beforeImagePath; 

    private String afterImagePath;

    @JsonBackReference("department-complaints")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = true)
    private Department department;

    @Column(nullable = true)
    private int rating;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(nullable = true) // Nullable because it's set by the admin later
    private LocalDate deadlineDate;

    @Column(nullable = true)
    private LocalDateTime resolvedAt;

    // --- Many-to-Many Relationship ---
    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "complaint_worker_assignment", // Join Table
        joinColumns = @JoinColumn(name = "complaint_id"),
        inverseJoinColumns = @JoinColumn(name = "worker_id")
    )
    private List<Worker> assignedWorkers;

}