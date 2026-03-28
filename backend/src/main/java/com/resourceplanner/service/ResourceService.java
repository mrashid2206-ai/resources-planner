package com.resourceplanner.service;

import com.resourceplanner.dto.request.ResourceRequest;
import com.resourceplanner.dto.response.ResourceResponse;
import java.util.List;
import java.util.UUID;

public interface ResourceService {
    List<ResourceResponse> getAllActive();
    ResourceResponse getById(UUID id);
    ResourceResponse create(ResourceRequest request);
    ResourceResponse update(UUID id, ResourceRequest request);
    void archive(UUID id);
    void delete(UUID id);
    List<ResourceResponse> importFromCsv(byte[] csvData);
}
