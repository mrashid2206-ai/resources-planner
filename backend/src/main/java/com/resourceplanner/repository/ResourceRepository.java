package com.resourceplanner.repository;

import com.resourceplanner.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    List<Resource> findByIsArchivedFalseOrderByNameAsc();

    @Query("SELECT r FROM Resource r LEFT JOIN FETCH r.assignments LEFT JOIN FETCH r.leaves WHERE r.id = :id")
    Resource findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT r FROM Resource r JOIN r.tags t WHERE t.name IN :tagNames AND r.isArchived = false")
    List<Resource> findByTagNames(@Param("tagNames") List<String> tagNames);

    @Query("SELECT COUNT(r) FROM Resource r WHERE r.isArchived = false")
    long countActive();
}
