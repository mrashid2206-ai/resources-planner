package com.resourceplanner.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leaves", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"resource_id", "month", "year"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Leave extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    @Builder.Default
    private Integer year = 2026;

    @Column(nullable = false)
    private Integer days;

    @Column(nullable = false, length = 255)
    private String reason;
}
