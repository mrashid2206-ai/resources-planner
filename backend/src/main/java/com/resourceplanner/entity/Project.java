package com.resourceplanner.entity;

import com.resourceplanner.enums.ProjectStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Project extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "project_status")
    @Builder.Default
    private ProjectStatus status = ProjectStatus.active;

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

    @Column(precision = 15, scale = 2)
    private BigDecimal budget;

    @Column(name = "budget_spent", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal budgetSpent = BigDecimal.ZERO;

    @Column(length = 255)
    private String client;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "source_bid_id")
    private UUID sourceBidId;

    @Column(name = "is_archived")
    @Builder.Default
    private Boolean isArchived = false;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Assignment> assignments = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProjectMilestone> milestones = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProjectNote> notes = new ArrayList<>();
}
