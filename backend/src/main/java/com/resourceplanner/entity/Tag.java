package com.resourceplanner.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tags")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Tag extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String name;
}
