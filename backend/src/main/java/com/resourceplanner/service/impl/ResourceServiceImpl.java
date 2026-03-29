package com.resourceplanner.service.impl;

import com.resourceplanner.dto.request.ResourceRequest;
import com.resourceplanner.dto.response.*;
import com.resourceplanner.entity.*;
import com.resourceplanner.exception.ResourceNotFoundException;
import com.resourceplanner.repository.*;
import com.resourceplanner.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final TagRepository tagRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponse> getAllActive() {
        return resourceRepository.findByIsArchivedFalseOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceResponse getById(UUID id) {
        Resource resource = resourceRepository.findByIdWithDetails(id);
        if (resource == null) {
            throw new ResourceNotFoundException("Resource", id);
        }
        return toResponse(resource);
    }

    @Override
    public ResourceResponse create(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .role(request.getRole())
                .email(request.getEmail())
                .phone(request.getPhone())
                .availability(request.getAvailability())
                .monthlyCapacity(request.getMonthlyCapacity())
                .hourlyRate(request.getHourlyRate())
                .avatarUrl(request.getAvatarUrl())
                .companyName(request.getCompanyName())
                .build();

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
            resource.setTags(tags);
        }

        return toResponse(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponse update(UUID id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", id));

        resource.setName(request.getName());
        resource.setRole(request.getRole());
        resource.setEmail(request.getEmail());
        resource.setPhone(request.getPhone());
        resource.setAvailability(request.getAvailability());
        resource.setMonthlyCapacity(request.getMonthlyCapacity());
        resource.setHourlyRate(request.getHourlyRate());
        resource.setAvatarUrl(request.getAvatarUrl());
        resource.setCompanyName(request.getCompanyName());
        if (request.getJoinDate() != null && !request.getJoinDate().isBlank()) {
            resource.setJoinDate(java.time.LocalDate.parse(request.getJoinDate()));
        }

        if (request.getTagIds() != null) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
            resource.setTags(tags);
        }

        return toResponse(resourceRepository.save(resource));
    }

    @Override
    public void archive(UUID id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", id));
        resource.setIsArchived(true);
        resourceRepository.save(resource);
    }

    @Override
    public void delete(UUID id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource", id);
        }
        resourceRepository.deleteById(id);
    }

    @Override
    public List<ResourceResponse> importFromCsv(byte[] csvData) {
        // CSV import logic: parse Name, Role, Tags columns
        // Implementation would use OpenCSV or Apache Commons CSV
        throw new UnsupportedOperationException("CSV import not yet implemented");
    }

    // ─── Mapping helpers ────────────────────────────────────────

    private ResourceResponse toResponse(Resource entity) {
        ResourceResponse dto = new ResourceResponse();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setRole(entity.getRole());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setAvailability(entity.getAvailability());
        dto.setMonthlyCapacity(entity.getMonthlyCapacity());
        dto.setHourlyRate(entity.getHourlyRate());
        dto.setAvatarUrl(entity.getAvatarUrl());
        dto.setCompanyName(entity.getCompanyName());
        dto.setJoinDate(entity.getJoinDate());
        dto.setIsArchived(entity.getIsArchived());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getAssignments() != null) {
            dto.setAssignments(entity.getAssignments().stream()
                    .map(this::toAssignmentResponse)
                    .collect(Collectors.toList()));
        }

        if (entity.getLeaves() != null) {
            dto.setLeaves(entity.getLeaves().stream()
                    .map(this::toLeaveResponse)
                    .collect(Collectors.toList()));
        }

        if (entity.getTags() != null) {
            dto.setTags(entity.getTags().stream()
                    .map(t -> {
                        TagResponse tr = new TagResponse();
                        tr.setId(t.getId());
                        tr.setName(t.getName());
                        return tr;
                    })
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

    private LeaveResponse toLeaveResponse(Leave l) {
        LeaveResponse dto = new LeaveResponse();
        dto.setId(l.getId());
        dto.setResourceId(l.getResource().getId());
        dto.setMonth(l.getMonth());
        dto.setYear(l.getYear());
        dto.setDays(l.getDays());
        dto.setReason(l.getReason());
        return dto;
    }
}
