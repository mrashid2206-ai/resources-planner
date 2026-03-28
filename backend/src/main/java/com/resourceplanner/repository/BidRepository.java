package com.resourceplanner.repository;

import com.resourceplanner.entity.Bid;
import com.resourceplanner.enums.BidStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface BidRepository extends JpaRepository<Bid, UUID> {

    List<Bid> findByIsArchivedFalseOrderByNameAsc();

    List<Bid> findByStatusAndIsArchivedFalse(BidStatus status);

    @Query("SELECT b.status, COUNT(b) FROM Bid b WHERE b.isArchived = false GROUP BY b.status")
    List<Object[]> countByStatus();

    @Query("SELECT COALESCE(SUM(b.estimatedValue * b.probability / 100.0), 0) FROM Bid b WHERE b.isArchived = false AND b.status IN ('pending', 'submitted')")
    BigDecimal getWeightedPipelineValue();

    long countByStatusInAndIsArchivedFalse(List<BidStatus> statuses);
}
