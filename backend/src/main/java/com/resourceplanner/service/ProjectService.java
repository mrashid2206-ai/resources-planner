package com.resourceplanner.service;

import com.resourceplanner.dto.request.ProjectRequest;
import com.resourceplanner.dto.response.ProjectResponse;
import java.util.List;
import java.util.UUID;

public interface ProjectService {
    List<ProjectResponse> getAllActive();
    ProjectResponse getById(UUID id);
    ProjectResponse create(ProjectRequest request);
    ProjectResponse update(UUID id, ProjectRequest request);
    void archive(UUID id);
    void delete(UUID id);
    ProjectResponse convertFromBid(UUID bidId);
}
