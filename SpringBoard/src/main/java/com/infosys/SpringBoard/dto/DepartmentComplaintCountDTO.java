package com.infosys.SpringBoard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DepartmentComplaintCountDTO {
    private String departmentName;
    private Long complaintCount;
}
