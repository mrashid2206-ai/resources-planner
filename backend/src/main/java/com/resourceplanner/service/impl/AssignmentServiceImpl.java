package com.resourceplanner.service.impl;

import com.resourceplanner.dto.request.AssignmentRequest;
import com.resourceplanner.dto.request.ReassignmentRequest;
import com.resourceplanner.dto.response.AssignmentResponse;
import com.resourceplanner.entity.*;
import com.resourceplanner.enums.AssignmentType;
import com.resourceplanner.exception.OverAllocationException;
import com.resourceplanner.exception.ResourceNotFoundException;
import com.resourceplanner.repository.*;
import com.resourceplanner.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final ResourceRepository resourceRepository;
    private final ProjectRepository projectRepository;
    private final BidRepository bidRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getByResource(UUID resourceId) {
        return assignmentRepository.findByResourceId(resourceId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getByProject(UUID projectId) {
        return assignmentRepository.findByProjectId(projectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getByBid(UUID bidId) {
        return assignmentRepository.findByBidId(bidId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AssignmentResponse create(AssignmentRequest request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));

        // Check for over-allocation (warn, don't block — per requirements)
        if (hasConflict(request.getResourceId(), request.getStartMonth(),
                request.getEndMonth(), request.getAllocation(), null)) {
            // Log warning but still allow creation per acceptance criteria:
            // "Over-allocation (>100%) is visually flagged but not blocked"
        }

        Assignment assignment = Assignment.builder()
                .resource(resource)
                .name(request.getName())
                .type(request.getType())
                .startMonth(request.getStartMonth())
                .endMonth(request.getEndMonth())
                .allocation(Math.min(100, Math.max(1, request.getAllocation())))
                .build();

        // Link to project or bid
        if (request.getType() == AssignmentType.project && request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project", request.getProjectId()));
            assignment.setProject(project);
        } else if (request.getType() == AssignmentType.bid && request.getBidId() != null) {
            Bid bid = bidRepository.findById(request.getBidId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bid", request.getBidId()));
            assignment.setBid(bid);
        }

        return toResponse(assignmentRepository.save(assignment));
    }

    @Override
    public AssignmentResponse update(UUID id, AssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", id));

        assignment.setName(request.getName());
        assignment.setType(request.getType());
        assignment.setStartMonth(request.getStartMonth());
        assignment.setEndMonth(request.getEndMonth());
        assignment.setAllocation(Math.min(100, Math.max(1, request.getAllocation())));

        // Update resource link if changed
        if (request.getResourceId() != null && !request.getResourceId().equals(assignment.getResource().getId())) {
            Resource newResource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));
            assignment.setResource(newResource);
        }

        // Update project/bid links
        if (request.getType() == AssignmentType.project) {
            assignment.setBid(null);
            if (request.getProjectId() != null) {
                assignment.setProject(projectRepository.findById(request.getProjectId()).orElse(null));
            }
        } else {
            assignment.setProject(null);
            if (request.getBidId() != null) {
                assignment.setBid(bidRepository.findById(request.getBidId()).orElse(null));
            }
        }

        return toResponse(assignmentRepository.save(assignment));
    }

    @Override
    public AssignmentResponse reassign(ReassignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", request.getAssignmentId()));

        // Reassign to new project
        if (request.getTargetProjectId() != null) {
            Project targetProject = projectRepository.findById(request.getTargetProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project", request.getTargetProjectId()));
            assignment.setProject(targetProject);
            assignment.setBid(null);
            assignment.setType(AssignmentType.project);
            assignment.setName(targetProject.getName());
        }
        // Reassign to new bid
        else if (request.getTargetBidId() != null) {
            Bid targetBid = bidRepository.findById(request.getTargetBidId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bid", request.getTargetBidId()));
            assignment.setBid(targetBid);
            assignment.setProject(null);
            assignment.setType(AssignmentType.bid);
            assignment.setName(targetBid.getName());
        }

        // Update optional fields
        if (request.getNewAllocation() != null) {
            assignment.setAllocation(Math.min(100, Math.max(1, request.getNewAllocation())));
        }
        if (request.getNewStartMonth() != null) {
            assignment.setStartMonth(request.getNewStartMonth());
        }
        if (request.getNewEndMonth() != null) {
            assignment.setEndMonth(request.getNewEndMonth());
        }

        return toResponse(assignmentRepository.save(assignment));
    }

    @Override
    public void delete(UUID id) {
        if (!assignmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Assignment", id);
        }
        assignmentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasConflict(UUID resourceId, int startMonth, int endMonth,
                                int allocation, UUID excludeAssignmentId) {
        List<Assignment> existing = assignmentRepository.findByResourceId(resourceId);

        for (int month = startMonth; month <= endMonth; month++) {
            final int m = month;
            int totalAlloc = existing.stream()
                    .filter(a -> excludeAssignmentId == null || !a.getId().equals(excludeAssignmentId))
                    .filter(a -> m >= a.getStartMonth() && m <= a.getEndMonth())
                    .mapToInt(Assignment::getAllocation)
                    .sum();

            if (totalAlloc + allocation > 100) {
                return true;
            }
        }
        return false;
    }

    // ─── Mapping ───

    private AssignmentResponse toResponse(Assignment a) {
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
