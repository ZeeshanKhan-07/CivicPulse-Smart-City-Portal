package com.infosys.SpringBoard.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
public class FileController {

    // Read the file upload directory from application.properties
    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * Endpoint to serve the image file given its filename.
     * URL Example: GET /api/files/download/a3e4d-uuid.jpg
     */
    @GetMapping("/download/{filename:.+}") // :.+ ensures the file extension is included in the path variable
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            // 1. Construct the full path to the file
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            // 2. Check if the file exists and is readable
            if (resource.exists() || resource.isReadable()) {
                // Determine content type (though the browser is smart enough)
                String contentType = "application/octet-stream"; 
                if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                }

                // 3. Return the file as a response
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}