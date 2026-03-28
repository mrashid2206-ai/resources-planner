package com.resourceplanner.service;

import com.resourceplanner.dto.request.LeaveRequest;
import com.resourceplanner.dto.response.LeaveResponse;
import java.util.List;
import java.util.UUID;

public interface LeaveService {
    List<LeaveResponse> getByResource(UUID resourceId);
    LeaveResponse create(LeaveRequest request);
    LeaveResponse update(UUID id, LeaveRequest request);
    void delete(UUID id);
}
