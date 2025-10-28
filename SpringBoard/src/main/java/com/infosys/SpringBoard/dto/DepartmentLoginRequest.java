package com.infosys.SpringBoard.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentLoginRequest {
    
    private String departmentName;
    private String adminEmail; // FIX: Renamed field to match JSON expectation
    private String password;
}