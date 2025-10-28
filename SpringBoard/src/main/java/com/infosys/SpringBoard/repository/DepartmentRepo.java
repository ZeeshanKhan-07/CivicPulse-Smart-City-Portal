package com.infosys.SpringBoard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.infosys.SpringBoard.entity.Department;

@Repository
public interface DepartmentRepo extends JpaRepository<Department, Long>{
    // This supports the old DepartmentController methods
    Department findByEmail(String email);
    
    // FIX: This supports the new login logic (Name + Email)
    Department findByNameAndEmail(String name, String email);
    
    // Add the missing findByName for debugging/simpler lookup if needed
    Department findByName(String name);
}