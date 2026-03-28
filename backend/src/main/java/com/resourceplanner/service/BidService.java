package com.resourceplanner.service;

import com.resourceplanner.dto.request.BidRequest;
import com.resourceplanner.dto.response.BidResponse;
import java.util.List;
import java.util.UUID;

public interface BidService {
    List<BidResponse> getAllActive();
    BidResponse getById(UUID id);
    BidResponse create(BidRequest request);
    BidResponse update(UUID id, BidRequest request);
    BidResponse updateStatus(UUID id, String status, String reason);
    void archive(UUID id);
    void delete(UUID id);
}
