package com.resourceplanner.service.impl;

import com.resourceplanner.dto.request.LeaveRequest;
import com.resourceplanner.dto.response.LeaveResponse;
import com.resourceplanner.entity.Leave;
import com.resourceplanner.entity.Resource;
import com.resourceplanner.exception.ResourceNotFoundException;
import com.resourceplanner.repository.LeaveRepository;
import com.resourceplanner.repository.ResourceRepository;
import com.resourceplanner.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRepository leaveRepository;
    private final ResourceRepository resourceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getByResource(UUID resourceId) {
        return leaveRepository.findByResourceId(resourceId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveResponse create(LeaveRequest request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));

        int year = request.getYear() != null ? request.getYear() : 2026;
        int days = Math.min(22, Math.max(1, request.getDays()));

        // Upsert: if leave exists for this resource/month/year, update it
        Optional<Leave> existing = leaveRepository
                .findByResourceIdAndMonthAndYear(request.getResourceId(), request.getMonth(), year);

        Leave leave;
        if (existing.isPresent()) {
            leave = existing.get();
            leave.setDays(days);
            leave.setReason(request.getReason());
        } else {
            leave = Leave.builder()
                    .resource(resource)
                    .month(request.getMonth())
                    .year(year)
                    .days(days)
                    .reason(request.getReason())
                    .build();
        }

        return toResponse(leaveRepository.save(leave));
    }

    @Override
    public LeaveResponse update(UUID id, LeaveRequest request) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave", id));

        leave.setDays(Math.min(22, Math.max(1, request.getDays())));
        leave.setReason(request.getReason());
        if (request.getMonth() != null) leave.setMonth(request.getMonth());
        if (request.getYear() != null) leave.setYear(request.getYear());

        return toResponse(leaveRepository.save(leave));
    }

    @Override
    public void delete(UUID id) {
        if (!leaveRepository.existsById(id)) {
            throw new ResourceNotFoundException("Leave", id);
        }
        leaveRepository.deleteById(id);
    }

    // ─── Mapping ───

    private LeaveResponse toResponse(Leave l) {
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
