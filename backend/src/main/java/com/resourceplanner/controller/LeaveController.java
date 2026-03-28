package com.resourceplanner.controller;

import com.resourceplanner.dto.request.LeaveRequest;
import com.resourceplanner.dto.response.LeaveResponse;
import com.resourceplanner.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
@Tag(name = "Leaves", description = "Leave/vacation management")
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping("/resource/{resourceId}")
    @Operation(summary = "Get all leaves for a resource")
    public ResponseEntity<List<LeaveResponse>> getByResource(@PathVariable UUID resourceId) {
        return ResponseEntity.ok(leaveService.getByResource(resourceId));
    }

    @PostMapping
    @Operation(summary = "Add a leave entry")
    public ResponseEntity<LeaveResponse> create(@Valid @RequestBody LeaveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a leave entry")
    public ResponseEntity<LeaveResponse> update(@PathVariable UUID id,
                                                 @Valid @RequestBody LeaveRequest request) {
        return ResponseEntity.ok(leaveService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a leave entry")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        leaveService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
