package com.resourceplanner.service.impl;

import com.resourceplanner.dto.response.DashboardResponse;
import com.resourceplanner.entity.Resource;
import com.resourceplanner.enums.BidStatus;
import com.resourceplanner.enums.ProjectStatus;
import com.resourceplanner.repository.*;
import com.resourceplanner.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final String[] MONTH_NAMES = {
        "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
    };
    private static final int DEFAULT_CAPACITY = 22;

    private final ResourceRepository resourceRepository;
    private final ProjectRepository projectRepository;
    private final BidRepository bidRepository;
    private final AssignmentRepository assignmentRepository;
    private final LeaveRepository leaveRepository;

    @Override
    public DashboardResponse getDashboardData() {
        DashboardResponse dashboard = new DashboardResponse();

        // Basic counts
        List<Resource> activeResources = resourceRepository.findByIsArchivedFalseOrderByNameAsc();
        dashboard.setTotalResources(activeResources.size());
        dashboard.setActiveProjects((int) projectRepository.countByStatusAndIsArchivedFalse(ProjectStatus.active));
        dashboard.setActiveBids((int) bidRepository.countByStatusInAndIsArchivedFalse(
                List.of(BidStatus.pending, BidStatus.submitted)));

        // Budget totals
        dashboard.setTotalBudget(projectRepository.findByIsArchivedFalseOrderByNameAsc().stream()
                .filter(p -> p.getBudget() != null)
                .map(p -> p.getBudget())
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        BigDecimal weightedPipeline = bidRepository.findByIsArchivedFalseOrderByNameAsc().stream()
                .filter(b -> b.getStatus() == BidStatus.pending || b.getStatus() == BidStatus.submitted)
                .filter(b -> b.getEstimatedValue() != null && b.getProbability() != null)
                .map(b -> b.getEstimatedValue()
                        .multiply(BigDecimal.valueOf(b.getProbability()))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboard.setWeightedPipeline(weightedPipeline);

        // Utilization heatmap
        List<DashboardResponse.UtilizationEntry> heatmap = new ArrayList<>();
        double totalUtil = 0;
        int utilCount = 0;

        for (Resource r : activeResources) {
            DashboardResponse.UtilizationEntry entry = new DashboardResponse.UtilizationEntry();
            entry.setResourceName(r.getName());
            entry.setRole(r.getRole());
            int[] monthly = new int[12];

            for (int m = 0; m < 12; m++) {
                final int month = m; // capture loop index for lambdas
                int capacity = r.getMonthlyCapacity() != null ? r.getMonthlyCapacity() : DEFAULT_CAPACITY;
                int leaveDays = r.getLeaves().stream()
                        .filter(l -> l.getMonth() == month)
                        .mapToInt(l -> l.getDays())
                        .sum();
                int effectiveCapacity = Math.max(0, capacity - leaveDays);

                int totalAllocation = r.getAssignments().stream()
                        .filter(a -> month >= a.getStartMonth() && month <= a.getEndMonth())
                        .mapToInt(a -> a.getAllocation())
                        .sum();

                int util = effectiveCapacity == 0 ? 0 : Math.min(Math.round(totalAllocation), 100);
                monthly[m] = util;
                totalUtil += util;
                utilCount++;
            }

            entry.setMonthlyUtilization(monthly);
            heatmap.add(entry);
        }

        dashboard.setUtilizationHeatmap(heatmap);
        dashboard.setAvgUtilization(utilCount > 0 ? totalUtil / utilCount : 0);

        // Projects by status
        Map<String, Long> projectsByStatus = projectRepository.countByStatus().stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> ((Number) row[1]).longValue()
                ));
        dashboard.setProjectsByStatus(projectsByStatus);

        // Bids by status
        Map<String, Long> bidsByStatus = bidRepository.countByStatus().stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> ((Number) row[1]).longValue()
                ));
        dashboard.setBidsByStatus(bidsByStatus);

        // Capacity forecast
        List<DashboardResponse.MonthlyCapacityForecast> forecast = new ArrayList<>();
        for (int m = 0; m < 12; m++) {
            DashboardResponse.MonthlyCapacityForecast mf = new DashboardResponse.MonthlyCapacityForecast();
            mf.setMonthIndex(m);
            mf.setMonthName(MONTH_NAMES[m]);

            int totalCap = 0;
            int totalAlloc = 0;
            for (Resource r : activeResources) {
                int cap = r.getMonthlyCapacity() != null ? r.getMonthlyCapacity() : DEFAULT_CAPACITY;
                int leave = r.getLeaves().stream()
                        .filter(l -> l.getMonth() == mf.getMonthIndex())
                        .mapToInt(l -> l.getDays())
                        .sum();
                totalCap += Math.max(0, cap - leave);

                final int month = m;
                totalAlloc += r.getAssignments().stream()
                        .filter(a -> month >= a.getStartMonth() && month <= a.getEndMonth())
                        .mapToInt(a -> a.getAllocation())
                        .sum();
            }

            mf.setTotalCapacity(totalCap);
            mf.setTotalAllocated(totalAlloc);
            mf.setAvailableCapacity(totalCap - totalAlloc);
            forecast.add(mf);
        }
        dashboard.setCapacityForecast(forecast);

        return dashboard;
    }
}
