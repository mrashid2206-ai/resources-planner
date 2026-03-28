package com.resourceplanner.controller;

import com.resourceplanner.dto.request.AssignmentRequest;
import com.resourceplanner.dto.request.ReassignmentRequest;
import com.resourceplanner.dto.response.AssignmentResponse;
import com.resourceplanner.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/assignments")
@RequiredArgsConstructor
@Tag(name = "Assignments", description = "Resource assignment management")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping("/resource/{resourceId}")
    @Operation(summary = "Get all assignments for a resource")
    public ResponseEntity<List<AssignmentResponse>> getByResource(@PathVariable UUID resourceId) {
        return ResponseEntity.ok(assignmentService.getByResource(resourceId));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get all assignments for a project")
    public ResponseEntity<List<AssignmentResponse>> getByProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(assignmentService.getByProject(projectId));
    }

    @GetMapping("/bid/{bidId}")
    @Operation(summary = "Get all assignments for a bid")
    public ResponseEntity<List<AssignmentResponse>> getByBid(@PathVariable UUID bidId) {
        return ResponseEntity.ok(assignmentService.getByBid(bidId));
    }

    @PostMapping
    @Operation(summary = "Create a new assignment")
    public ResponseEntity<AssignmentResponse> create(@Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an assignment")
    public ResponseEntity<AssignmentResponse> update(@PathVariable UUID id,
                                                      @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.update(id, request));
    }

    @PostMapping("/reassign")
    @Operation(summary = "Reassign a resource to a different project/bid")
    public ResponseEntity<AssignmentResponse> reassign(@Valid @RequestBody ReassignmentRequest request) {
        return ResponseEntity.ok(assignmentService.reassign(request));
    }

    @GetMapping("/conflicts")
    @Operation(summary = "Check for allocation conflicts")
    public ResponseEntity<Map<String, Boolean>> checkConflicts(
            @RequestParam UUID resourceId,
            @RequestParam int startMonth,
            @RequestParam int endMonth,
            @RequestParam int allocation,
            @RequestParam(required = false) UUID excludeId) {
        boolean hasConflict = assignmentService.hasConflict(resourceId, startMonth, endMonth, allocation, excludeId);
        return ResponseEntity.ok(Map.of("hasConflict", hasConflict));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an assignment")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
