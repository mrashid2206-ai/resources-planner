package com.resourceplanner.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_milestones")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProjectMilestone extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    @Builder.Default
    private Integer year = 2026;

    @Column(name = "is_completed")
    @Builder.Default
    private Boolean isCompleted = false;
}
