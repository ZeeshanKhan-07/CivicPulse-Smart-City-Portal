package com.infosys.SpringBoard.repository;

import com.infosys.SpringBoard.entity.Complains;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplainRepository extends JpaRepository<Complains, Long> {

    @Query("SELECT c FROM Complains c LEFT JOIN FETCH c.assignedWorkers WHERE c.userId = :userId")
    List<Complains> findComplaintsWithWorkersByUserId(@Param("userId") Long userId);

    List<Complains> findByDepartmentId(Long departmentId);

    @Query("SELECT c.deadlineDate FROM Complains c WHERE c.complainId = :complainId")
    Optional<LocalDate> findDeadlineDateByComplainId(@Param("complainId") Long complainId);

    @Query("SELECT c FROM Complains c LEFT JOIN FETCH c.assignedWorkers workers WHERE c.complainId = :complainId")
    Optional<Complains> findByIdWithAssignedWorkers(@Param("complainId") Long complainId);

    @Query("SELECT c.rating FROM Complains c WHERE c.complainId = :complainId")
    Integer findRatingByComplainId(@Param("complainId") Long complainId);

}