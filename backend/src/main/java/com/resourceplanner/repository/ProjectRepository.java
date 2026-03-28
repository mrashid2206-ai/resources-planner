package com.resourceplanner.repository;

import com.resourceplanner.entity.Project;
import com.resourceplanner.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findByIsArchivedFalseOrderByNameAsc();

    List<Project> findByStatusAndIsArchivedFalse(ProjectStatus status);

    @Query("SELECT p.status, COUNT(p) FROM Project p WHERE p.isArchived = false GROUP BY p.status")
    List<Object[]> countByStatus();

    long countByStatusAndIsArchivedFalse(ProjectStatus status);
}
