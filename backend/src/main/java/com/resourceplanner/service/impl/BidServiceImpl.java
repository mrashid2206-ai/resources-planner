package com.resourceplanner.service.impl;

import com.resourceplanner.dto.request.BidRequest;
import com.resourceplanner.dto.response.AssignmentResponse;
import com.resourceplanner.dto.response.BidResponse;
import com.resourceplanner.entity.*;
import com.resourceplanner.enums.BidStatus;
import com.resourceplanner.exception.ResourceNotFoundException;
import com.resourceplanner.repository.BidRepository;
import com.resourceplanner.service.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BidServiceImpl implements BidService {

    private final BidRepository bidRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BidResponse> getAllActive() {
        return bidRepository.findByIsArchivedFalseOrderByNameAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BidResponse getById(UUID id) {
        Bid bid = bidRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bid", id));
        return toResponse(bid);
    }

    @Override
    public BidResponse create(BidRequest request) {
        Bid bid = Bid.builder()
                .name(request.getName())
                .status(request.getStatus() != null ? request.getStatus() : BidStatus.pending)
                .startMonth(request.getStartMonth())
                .endMonth(request.getEndMonth())
                .startYear(request.getStartYear() != null ? request.getStartYear() : 2026)
                .endYear(request.getEndYear() != null ? request.getEndYear() : 2026)
                .estimatedValue(request.getEstimatedValue())
                .probability(request.getProbability() != null ? request.getProbability() : 50)
                .client(request.getClient())
                .description(request.getDescription())
                .build();

        return toResponse(bidRepository.save(bid));
    }

    @Override
    public BidResponse update(UUID id, BidRequest request) {
        Bid bid = bidRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bid", id));

        bid.setName(request.getName());
        if (request.getStatus() != null) bid.setStatus(request.getStatus());
        bid.setStartMonth(request.getStartMonth());
        bid.setEndMonth(request.getEndMonth());
        if (request.getStartYear() != null) bid.setStartYear(request.getStartYear());
        if (request.getEndYear() != null) bid.setEndYear(request.getEndYear());
        bid.setEstimatedValue(request.getEstimatedValue());
        if (request.getProbability() != null) bid.setProbability(request.getProbability());
        bid.setClient(request.getClient());
        bid.setDescription(request.getDescription());
        if (request.getWinLossReason() != null) bid.setWinLossReason(request.getWinLossReason());

        return toResponse(bidRepository.save(bid));
    }

    @Override
    public BidResponse updateStatus(UUID id, String status, String reason) {
        Bid bid = bidRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bid", id));

        BidStatus oldStatus = bid.getStatus();
        BidStatus newStatus = BidStatus.valueOf(status.toLowerCase());

        // Record status change in history
        BidStatusHistory history = BidStatusHistory.builder()
                .bid(bid)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .reason(reason)
                .build();
        bid.getStatusHistory().add(history);

        bid.setStatus(newStatus);

        // Record win/loss reason if closing
        if ((newStatus == BidStatus.won || newStatus == BidStatus.lost) && reason != null) {
            bid.setWinLossReason(reason);
        }

        return toResponse(bidRepository.save(bid));
    }

    @Override
    public void archive(UUID id) {
        Bid bid = bidRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bid", id));
        bid.setIsArchived(true);
        bidRepository.save(bid);
    }

    @Override
    public void delete(UUID id) {
        if (!bidRepository.existsById(id)) {
            throw new ResourceNotFoundException("Bid", id);
        }
        bidRepository.deleteById(id);
    }

    // ─── Mapping ───

    private BidResponse toResponse(Bid b) {
        BidResponse dto = new BidResponse();
        dto.setId(b.getId());
        dto.setName(b.getName());
        dto.setStatus(b.getStatus());
        dto.setStartMonth(b.getStartMonth());
        dto.setEndMonth(b.getEndMonth());
        dto.setStartYear(b.getStartYear());
        dto.setEndYear(b.getEndYear());
        dto.setEstimatedValue(b.getEstimatedValue());
        dto.setProbability(b.getProbability());
        dto.setClient(b.getClient());
        dto.setDescription(b.getDescription());
        dto.setWinLossReason(b.getWinLossReason());
        dto.setConvertedProjectId(b.getConvertedProjectId());
        dto.setIsArchived(b.getIsArchived());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setUpdatedAt(b.getUpdatedAt());

        if (b.getAssignments() != null) {
            dto.setAssignments(b.getAssignments().stream()
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
