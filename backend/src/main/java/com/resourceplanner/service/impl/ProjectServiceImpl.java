package com.resourceplanner.service.impl;

import com.resourceplanner.dto.request.ProjectRequest;
import com.resourceplanner.dto.response.AssignmentResponse;
import com.resourceplanner.dto.response.ProjectResponse;
import com.resourceplanner.entity.*;
import com.resourceplanner.enums.AssignmentType;
import com.resourceplanner.enums.BidStatus;
import com.resourceplanner.exception.ResourceNotFoundException;
import com.resourceplanner.repository.*;
import com.resourceplanner.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final BidRepository bidRepository;
    private final AssignmentRepository assignmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllActive() {
        return projectRepository.findByIsArchivedFalseOrderByNameAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getById(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        return toResponse(project);
    }

    @Override
    public ProjectResponse create(ProjectRequest request) {
        Project project = Project.builder()
                .name(request.getName())
                .status(request.getStatus())
                .startMonth(request.getStartMonth())
                .endMonth(request.getEndMonth())
                .startYear(request.getStartYear() != null ? request.getStartYear() : 2026)
                .endYear(request.getEndYear() != null ? request.getEndYear() : 2026)
                .budget(request.getBudget())
                .client(request.getClient())
                .description(request.getDescription())
                .build();

        return toResponse(projectRepository.save(project));
    }

    @Override
    public ProjectResponse update(UUID id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));

        project.setName(request.getName());
        project.setStatus(request.getStatus());
        project.setStartMonth(request.getStartMonth());
        project.setEndMonth(request.getEndMonth());
        if (request.getStartYear() != null) project.setStartYear(request.getStartYear());
        if (request.getEndYear() != null) project.setEndYear(request.getEndYear());
        project.setBudget(request.getBudget());
        project.setClient(request.getClient());
        project.setDescription(request.getDescription());

        return toResponse(projectRepository.save(project));
    }

    @Override
    public void archive(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        project.setIsArchived(true);
        projectRepository.save(project);
    }

    @Override
    public void delete(UUID id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project", id);
        }
        projectRepository.deleteById(id);
    }

    @Override
    public ProjectResponse convertFromBid(UUID bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid", bidId));

        if (bid.getStatus() != BidStatus.won) {
            throw new IllegalStateException("Only won bids can be converted to projects");
        }

        // Create project from bid data
        Project project = Project.builder()
                .name(bid.getName().replaceFirst("(?i)^bid\\s*[-–—:]\\s*", ""))
                .status(com.resourceplanner.enums.ProjectStatus.active)
                .startMonth(bid.getStartMonth())
                .endMonth(bid.getEndMonth())
                .startYear(bid.getStartYear())
                .endYear(bid.getEndYear())
                .budget(bid.getEstimatedValue())
                .client(bid.getClient())
                .description(bid.getDescription())
                .sourceBidId(bid.getId())
                .build();

        Project savedProject = projectRepository.save(project);

        // Transfer all bid assignments to the new project
        List<Assignment> bidAssignments = assignmentRepository.findByBidId(bidId);
        for (Assignment original : bidAssignments) {
            Assignment newAssignment = Assignment.builder()
                    .resource(original.getResource())
                    .project(savedProject)
                    .name(savedProject.getName())
                    .type(AssignmentType.project)
                    .startMonth(savedProject.getStartMonth())
                    .endMonth(savedProject.getEndMonth())
                    .startYear(savedProject.getStartYear())
                    .endYear(savedProject.getEndYear())
                    .allocation(original.getAllocation())
                    .build();
            assignmentRepository.save(newAssignment);
        }

        // Link the bid to the new project
        bid.setConvertedProjectId(savedProject.getId());
        bidRepository.save(bid);

        return toResponse(savedProject);
    }

    // ─── Mapping ───

    private ProjectResponse toResponse(Project p) {
        ProjectResponse dto = new ProjectResponse();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setStatus(p.getStatus());
        dto.setStartMonth(p.getStartMonth());
        dto.setEndMonth(p.getEndMonth());
        dto.setStartYear(p.getStartYear());
        dto.setEndYear(p.getEndYear());
        dto.setBudget(p.getBudget());
        dto.setBudgetSpent(p.getBudgetSpent());
        dto.setClient(p.getClient());
        dto.setDescription(p.getDescription());
        dto.setSourceBidId(p.getSourceBidId());
        dto.setIsArchived(p.getIsArchived());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());

        if (p.getAssignments() != null) {
            dto.setAssignments(p.getAssignments().stream()
                    .map(this::toAssignmentResponse)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private AssignmentResponse toAssignmentResponse(Assignment a) {
        AssignmentResponse dto = new AssignmentResponse();
        dto.setId(a.getId());
        dto.setResourceId(a.getResource().getId());
        dto.setResourceName(a.getResource().getName());
        dto.setProjectId(a.getProject() != null ? a.getProject().getId() : null);
        dto.setBidId(a.getBid() != null ? a.getBid().getId() : null);
        dto.setName(a.getName());
        dto.setType(a.getType());
        dto.setStartMonth(a.getStartMonth());
        dto.setEndMonth(a.getEndMonth());
        dto.setStartYear(a.getStartYear());
        dto.setEndYear(a.getEndYear());
        dto.setAllocation(a.getAllocation());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
}
