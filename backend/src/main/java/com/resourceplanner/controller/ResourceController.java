package com.resourceplanner.controller;

import com.resourceplanner.dto.request.ResourceRequest;
import com.resourceplanner.dto.response.ResourceResponse;
import com.resourceplanner.service.ResourceService;
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
@RequestMapping("/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "Resource (team member) management")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    @Operation(summary = "Get all active resources")
    public ResponseEntity<List<ResourceResponse>> getAll() {
        return ResponseEntity.ok(resourceService.getAllActive());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource by ID with assignments and leaves")
    public ResponseEntity<ResourceResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new resource")
    public ResponseEntity<ResourceResponse> create(@Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing resource")
    public ResponseEntity<ResourceResponse> update(@PathVariable UUID id,
                                                    @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.update(id, request));
    }

    @PatchMapping("/{id}/archive")
    @Operation(summary = "Archive a resource (soft delete)")
    public ResponseEntity<Void> archive(@PathVariable UUID id) {
        resourceService.archive(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Permanently delete a resource")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
