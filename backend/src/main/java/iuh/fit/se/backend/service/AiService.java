package iuh.fit.se.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AiService.class);

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.model:gpt-3.5-turbo}")
    private String openaiApiModel;

    @Value("${openai.api.base-url:https://api.openai.com/v1}")
    private String openaiApiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String queryOpenAi(String message) {
        if (openaiApiKey == null || openaiApiKey.isBlank()) {
            // Helpful message to make local dev onboarding smoother
            throw new RuntimeException("OpenAI API key is not configured. Please set environment variable OPENAI_API_KEY or `openai.api.key` property.");
        }

        String url = String.format("%s/chat/completions", openaiApiBaseUrl);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        Map<String, Object> body = Map.of(
            "model", openaiApiModel,
                "messages", List.of(Map.of("role", "user", "content", message)),
                "max_tokens", 700
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        Map result = restTemplate.postForObject(url, entity, Map.class);
        try {
            List choices = (List) result.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map first = (Map) choices.get(0);
                Map messageNode = (Map) first.get("message");
                if (messageNode != null) {
                    return (String) messageNode.get("content");
                }
            }
        } catch (Exception ex) {
            throw new RuntimeException("Failed to parse OpenAI response", ex);
        }
        return "";
    }

    @PostConstruct
    public void init() {
        if (openaiApiKey == null || openaiApiKey.isBlank()) {
            LOGGER.warn("OpenAI API key is not configured. Set OPENAI_API_KEY environment variable or openai.api.key property to enable AI endpoint.");
        } else {
            LOGGER.info("OpenAI API key configured. AI endpoint is enabled.");
        }
    }
}
