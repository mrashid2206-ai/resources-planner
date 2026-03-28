package com.resourceplanner.entity;

import com.resourceplanner.enums.BidStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bids")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Bid extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "bid_status")
    @Builder.Default
    private BidStatus status = BidStatus.pending;

    @Column(name = "start_month", nullable = false)
    private Integer startMonth;

    @Column(name = "end_month", nullable = false)
    private Integer endMonth;

    @Column(name = "start_year", nullable = false)
    @Builder.Default
    private Integer startYear = 2026;

    @Column(name = "end_year", nullable = false)
    @Builder.Default
    private Integer endYear = 2026;

    @Column(name = "estimated_value", precision = 15, scale = 2)
    private BigDecimal estimatedValue;

    @Column
    private Integer probability;

    @Column(length = 255)
    private String client;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "win_loss_reason", columnDefinition = "TEXT")
    private String winLossReason;

    @Column(name = "converted_project_id")
    private UUID convertedProjectId;

    @Column(name = "is_archived")
    @Builder.Default
    private Boolean isArchived = false;

    @OneToMany(mappedBy = "bid", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Assignment> assignments = new ArrayList<>();

    @OneToMany(mappedBy = "bid", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BidStatusHistory> statusHistory = new ArrayList<>();
}
