package com.resourceplanner.controller;

import com.resourceplanner.dto.request.ProjectRequest;
import com.resourceplanner.dto.response.ProjectResponse;
import com.resourceplanner.service.ProjectService;
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
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "Get all active projects")
    public ResponseEntity<List<ProjectResponse>> getAll() {
        return ResponseEntity.ok(projectService.getAllActive());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID with assignments")
    public ResponseEntity<ProjectResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new project")
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a project")
    public ResponseEntity<ProjectResponse> update(@PathVariable UUID id,
                                                   @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.update(id, request));
    }

    @PatchMapping("/{id}/archive")
    @Operation(summary = "Archive a project")
    public ResponseEntity<Void> archive(@PathVariable UUID id) {
        projectService.archive(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a project")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/convert-bid/{bidId}")
    @Operation(summary = "Convert a won bid to a project")
    public ResponseEntity<ProjectResponse> convertFromBid(@PathVariable UUID bidId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.convertFromBid(bidId));
    }
}
