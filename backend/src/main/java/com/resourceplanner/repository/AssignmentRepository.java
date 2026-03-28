package com.resourceplanner.repository;

import com.resourceplanner.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

    List<Assignment> findByResourceId(UUID resourceId);

    List<Assignment> findByProjectId(UUID projectId);

    List<Assignment> findByBidId(UUID bidId);

    @Query("SELECT a FROM Assignment a WHERE a.resource.id = :resourceId " +
           "AND a.startMonth <= :month AND a.endMonth >= :month")
    List<Assignment> findActiveInMonth(@Param("resourceId") UUID resourceId, @Param("month") int month);

    @Query("SELECT SUM(a.allocation) FROM Assignment a WHERE a.resource.id = :resourceId " +
           "AND a.startMonth <= :month AND a.endMonth >= :month")
    Integer getTotalAllocationForMonth(@Param("resourceId") UUID resourceId, @Param("month") int month);
}
