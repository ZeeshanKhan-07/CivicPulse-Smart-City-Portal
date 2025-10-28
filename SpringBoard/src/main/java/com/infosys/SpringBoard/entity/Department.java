package com.infosys.SpringBoard.entity;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // Ensure this is present if using Lombok
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(unique = true)
    private String email; // Corresponds to the DB column 'email' for login

    private String password; // Corresponds to the DB column 'password'

    // FIX: @JsonManagedReference to manage the Worker list serialization
    @JsonManagedReference("department-workers")
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Worker> workers;

    // FIX: @JsonManagedReference for Complaint list serialization
    @JsonManagedReference("department-complaints")
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Complains> complaints;

    public Department(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}