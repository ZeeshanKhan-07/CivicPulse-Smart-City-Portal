package com.infosys.SpringBoard.repository;

import com.infosys.SpringBoard.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkerRepository extends JpaRepository<Worker, Long> {
    List<Worker> findByDepartmentId(Long departmentId);
}
