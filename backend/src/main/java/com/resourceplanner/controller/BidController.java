package com.resourceplanner.controller;

import com.resourceplanner.dto.request.BidRequest;
import com.resourceplanner.dto.response.BidResponse;
import com.resourceplanner.service.BidService;
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
@RequestMapping("/bids")
@RequiredArgsConstructor
@Tag(name = "Bids", description = "Bid/proposal management")
public class BidController {

    private final BidService bidService;

    @GetMapping
    @Operation(summary = "Get all active bids")
    public ResponseEntity<List<BidResponse>> getAll() {
        return ResponseEntity.ok(bidService.getAllActive());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bid by ID")
    public ResponseEntity<BidResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(bidService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new bid")
    public ResponseEntity<BidResponse> create(@Valid @RequestBody BidRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bidService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a bid")
    public ResponseEntity<BidResponse> update(@PathVariable UUID id,
                                               @Valid @RequestBody BidRequest request) {
        return ResponseEntity.ok(bidService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update bid status with reason")
    public ResponseEntity<BidResponse> updateStatus(@PathVariable UUID id,
                                                     @RequestParam String status,
                                                     @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(bidService.updateStatus(id, status, reason));
    }

    @PatchMapping("/{id}/archive")
    @Operation(summary = "Archive a bid")
    public ResponseEntity<Void> archive(@PathVariable UUID id) {
        bidService.archive(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a bid")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bidService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
