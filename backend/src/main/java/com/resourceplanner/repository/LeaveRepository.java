package com.resourceplanner.repository;

import com.resourceplanner.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, UUID> {

    List<Leave> findByResourceId(UUID resourceId);

    Optional<Leave> findByResourceIdAndMonthAndYear(UUID resourceId, Integer month, Integer year);
}
