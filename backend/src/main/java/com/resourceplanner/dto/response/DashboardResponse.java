package com.resourceplanner.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class DashboardResponse {
    private int totalResources;
    private int activeProjects;
    private int activeBids;
    private double avgUtilization;
    private BigDecimal totalBudget;
    private BigDecimal weightedPipeline;

    private List<UtilizationEntry> utilizationHeatmap;
    private Map<String, Long> projectsByStatus;
    private Map<String, Long> bidsByStatus;
    private List<MonthlyCapacityForecast> capacityForecast;

    @Data
    public static class UtilizationEntry {
        private String resourceName;
        private String role;
        private int[] monthlyUtilization; // 12 values
    }

    @Data
    public static class MonthlyCapacityForecast {
        private int monthIndex;
        private String monthName;
        private int totalCapacity;
        private int totalAllocated;
        private int availableCapacity;
    }
}
