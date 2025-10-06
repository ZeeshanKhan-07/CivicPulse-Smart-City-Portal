package com.infosys.SpringBoard.repository;

import com.infosys.SpringBoard.entity.Complains;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplainRepository extends JpaRepository<Complains, Integer> {
    // Custom repository methods can be added here if needed
    List<Complains> findByUserId(int userId); // Method to find complaints by userId
}