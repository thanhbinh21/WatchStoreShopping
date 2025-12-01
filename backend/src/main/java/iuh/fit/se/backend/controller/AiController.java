package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.AiQueryRequest;
import iuh.fit.se.backend.dto.response.AiQueryResponse;
import iuh.fit.se.backend.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    private final AiService aiService;

    @PostMapping("/query")
    public ResponseEntity<AiQueryResponse> queryAi(@RequestBody AiQueryRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new AiQueryResponse("Message is required"));
        }
        try {
            String reply = aiService.queryOpenAi(request.getMessage().trim());
            return ResponseEntity.ok(new AiQueryResponse(reply));
        } catch (Exception ex) {
            // Log error and respond gracefully
            ex.printStackTrace();
            return ResponseEntity.status(503).body(new AiQueryResponse("AI service unavailable: " + ex.getMessage()));
        }
    }
}
