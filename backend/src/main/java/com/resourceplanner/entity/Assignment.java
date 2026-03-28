package com.resourceplanner.entity;

import com.resourceplanner.enums.AssignmentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "assignments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Assignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id")
    private Bid bid;

    @Column(nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "assignment_type", nullable = false)
    private AssignmentType type;

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

    @Column(nullable = false)
    private Integer allocation;
}
