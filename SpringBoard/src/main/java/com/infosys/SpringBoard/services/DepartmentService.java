package com.infosys.SpringBoard.services;

import com.infosys.SpringBoard.entity.Department;
import com.infosys.SpringBoard.repository.DepartmentRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepo departmentRepository;

    public Optional<Department> loginWithDetails(String departmentName, String email, String password) {
        Department department = departmentRepository.findByNameAndEmail(departmentName, email);
        System.out.println("Login attempt: " + departmentName + " | " + email + " | " + password);
        System.out.println("Found department: " + (department != null ? department.getPassword() : "null"));

        if (department != null && department.getPassword().equals(password)) {
            return Optional.of(department);
        }
        return Optional.empty();
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

}