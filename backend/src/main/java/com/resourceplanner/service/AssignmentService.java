package com.resourceplanner.service;

import com.resourceplanner.dto.request.AssignmentRequest;
import com.resourceplanner.dto.request.ReassignmentRequest;
import com.resourceplanner.dto.response.AssignmentResponse;
import java.util.List;
import java.util.UUID;

public interface AssignmentService {
    List<AssignmentResponse> getByResource(UUID resourceId);
    List<AssignmentResponse> getByProject(UUID projectId);
    List<AssignmentResponse> getByBid(UUID bidId);
    AssignmentResponse create(AssignmentRequest request);
    AssignmentResponse update(UUID id, AssignmentRequest request);
    AssignmentResponse reassign(ReassignmentRequest request);
    void delete(UUID id);
    boolean hasConflict(UUID resourceId, int startMonth, int endMonth, int allocation, UUID excludeAssignmentId);
}
