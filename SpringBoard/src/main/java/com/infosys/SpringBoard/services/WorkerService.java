package com.infosys.SpringBoard.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.SpringBoard.entity.Worker;
import com.infosys.SpringBoard.repository.DepartmentRepo;
import com.infosys.SpringBoard.repository.WorkerRepository;

@Service
public class WorkerService {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private DepartmentRepo departmentRepository;

    public Worker addWorker(Long departmentId, Worker worker) {
        return departmentRepository.findById(departmentId).map(department -> {
            worker.setDepartment(department);
            return workerRepository.save(worker);
        }).orElseThrow(() -> new RuntimeException("Department not found with id " + departmentId));
    }

    public List<Worker> getWorkersByDepartmentId(Long departmentId) {
        return workerRepository.findByDepartmentId(departmentId);
    }
    
    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }
}
