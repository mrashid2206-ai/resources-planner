package com.resourceplanner.entity;

import com.resourceplanner.enums.BidStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bid_status_history")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BidStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id", nullable = false)
    private Bid bid;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", columnDefinition = "bid_status")
    private BidStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", columnDefinition = "bid_status", nullable = false)
    private BidStatus newStatus;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "changed_by", length = 150)
    private String changedBy;

    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private Instant changedAt;
}
