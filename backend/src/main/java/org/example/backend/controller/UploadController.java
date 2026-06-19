package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.service.UploadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {
    private final UploadService uploadService;

    /**
     * Initiate chunked upload - Tạo upload session
     * POST /api/upload/chunk/init
     */
    @PostMapping("/chunk/init")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> initChunkedUpload(
            @RequestParam("fileName") String fileName,
            @RequestParam("fileSize") Long fileSize,
            @RequestParam("fileType") String fileType,
            Principal principal) {
        try {
            String uploadId = uploadService.initChunkedUpload(fileName, fileSize, fileType, principal.getName());
            return ResponseEntity.ok(new ChunkedUploadResponse(uploadId, "Upload session created"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to initialize upload: " + e.getMessage()));
        }
    }

    /**
     * Upload chunk - Upload từng phần của file
     * POST /api/upload/chunk
     */
    @PostMapping("/chunk")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadChunk(
            @RequestParam("uploadId") String uploadId,
            @RequestParam("chunkNumber") Integer chunkNumber,
            @RequestParam("totalChunks") Integer totalChunks,
            @RequestParam("chunk") MultipartFile chunk,
            Principal principal) {
        try {
            boolean isComplete = uploadService.uploadChunk(uploadId, chunkNumber, totalChunks, chunk, principal.getName());

            if (isComplete) {
                // Upload hoàn tất, trả về URL
                String fileUrl = uploadService.completeChunkedUpload(uploadId, principal.getName());
                return ResponseEntity.ok(new ChunkedUploadCompleteResponse(uploadId, fileUrl, true));
            } else {
                // Chưa hoàn tất, tiếp tục upload chunks tiếp theo
                return ResponseEntity.ok(new ChunkedUploadProgressResponse(uploadId, chunkNumber, totalChunks, false));
            }
        } catch (Exception e) {
            e.printStackTrace(); // Log error for debugging
            String errorMessage = e.getMessage();

            // Provide more helpful error messages
            if (errorMessage != null && errorMessage.contains("Cloudinary")) {
                errorMessage = "Cloudinary configuration error: " + errorMessage;
            } else if (errorMessage != null && errorMessage.contains("not configured")) {
                errorMessage = "Server configuration error: " + errorMessage;
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to upload chunk: " + errorMessage));
        }
    }

    /**
     * Get upload progress - Lấy tiến trình upload
     * GET /api/upload/chunk/{uploadId}/progress
     */
    @GetMapping("/chunk/{uploadId}/progress")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUploadProgress(
            @PathVariable String uploadId,
            Principal principal) {
        try {
            var progress = uploadService.getUploadProgress(uploadId, principal.getName());
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Upload session not found: " + e.getMessage()));
        }
    }

    /**
     * Cancel upload - Hủy upload
     * DELETE /api/upload/chunk/{uploadId}
     */
    @DeleteMapping("/chunk/{uploadId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelUpload(
            @PathVariable String uploadId,
            Principal principal) {
        try {
            uploadService.cancelChunkedUpload(uploadId, principal.getName());
            return ResponseEntity.ok(new SuccessResponse("Upload cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to cancel upload: " + e.getMessage()));
        }
    }

    // Response DTOs
    record ChunkedUploadResponse(String uploadId, String message) {}
    record ChunkedUploadProgressResponse(String uploadId, Integer uploadedChunks, Integer totalChunks, Boolean isComplete) {}
    record ChunkedUploadCompleteResponse(String uploadId, String fileUrl, Boolean isComplete) {}
    record ErrorResponse(String error) {}
    record SuccessResponse(String message) {}
}

