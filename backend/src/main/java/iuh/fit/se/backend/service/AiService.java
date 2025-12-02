package iuh.fit.se.backend.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AiService.class);

    // Prefer custom key, fallback to Spring AI property if present
    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${spring.ai.openai.api-key:}")
    private String springAiOpenaiApiKey;

    // Prefer custom model, fallback to Spring AI chat options model
    @Value("${openai.api.model:${spring.ai.openai.chat.options.model:gpt-3.5-turbo}}")
    private String openaiApiModel;

    @Value("${openai.api.temperature:${spring.ai.openai.chat.options.temperature:0.7}}")
    private double openaiApiTemperature;

    @Value("${openai.api.max-tokens:${spring.ai.openai.chat.options.max-tokens:700}}")
    private int openaiApiMaxTokens;

    // Prefer custom base URL, fallback to Spring AI base-url
    @Value("${openai.api.base-url:${spring.ai.openai.base-url:https://api.openai.com/v1}}")
    private String openaiApiBaseUrl;

    // Optional: required for project-scoped keys (prefixed with sk-proj-)
    @Value("${openai.api.project-id:}")
    private String openaiProjectId;

    @Value("${spring.ai.openai.project-id:}")
    private String springAiProjectId;

    // Optional: allow callers to add beta headers (e.g. assistants=v2 for Responses API)
    @Value("${openai.api.beta-header:}")
    private String openaiBetaHeader;

    // Use OpenAI Responses API instead of legacy chat completions
    @Value("${openai.api.use-responses:${spring.ai.openai.responses:false}}")
    private boolean openaiUseResponsesApi;

    private final RestTemplate restTemplate;

    public String queryOpenAi(String message) {
        String apiKey = resolveOpenaiApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            // Helpful message to make local dev onboarding smoother
            throw new RuntimeException("OpenAI API key is not configured. Please set environment variable OPENAI_API_KEY or `openai.api.key` property.");
        }

        String projectId = resolveOpenaiProjectId();
        boolean useResponsesApi = shouldUseResponsesApi(projectId);
        String url = buildOpenAiEndpoint(openaiApiBaseUrl, useResponsesApi);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey.trim());
        if (projectId != null && !projectId.isBlank()) {
            headers.add("OpenAI-Project", projectId.trim());
        }
        if (useResponsesApi) {
            String betaHeader = (openaiBetaHeader != null && !openaiBetaHeader.isBlank())
                    ? openaiBetaHeader.trim()
                    : "responses=v1";
            headers.add("OpenAI-Beta", betaHeader);
        } else if (openaiBetaHeader != null && !openaiBetaHeader.isBlank()) {
            headers.add("OpenAI-Beta", openaiBetaHeader.trim());
        }

        Map<String, Object> body = useResponsesApi
                ? buildResponsesPayload(message)
                : buildChatPayload(message);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        try {
            Map result = restTemplate.postForObject(url, entity, Map.class);
            return useResponsesApi ? extractResponsesReply(result) : extractChatReply(result);
        } catch (HttpClientErrorException ex) {
            String responseBody = ex.getResponseBodyAsString(StandardCharsets.UTF_8);
            LOGGER.error("OpenAI API error: status={} body={}", ex.getStatusCode(), responseBody);
            throw new RuntimeException(String.format("OpenAI API error (%s). %s", ex.getStatusCode().value(), responseBody));
        } catch (Exception ex) {
            throw new RuntimeException("Failed to parse OpenAI response", ex);
        }
    }

    @PostConstruct
    public void init() {
        String apiKey = resolveOpenaiApiKey();
        String projectId = resolveOpenaiProjectId();
        if (apiKey == null) {
            LOGGER.warn("OpenAI API key is not configured. Set OPENAI_API_KEY environment variable or openai.api.key property to enable AI endpoint.");
        } else {
            LOGGER.info("OpenAI API key configured. AI endpoint is enabled.");
        }
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("OpenAI API key source={} present={} prefix={} length={}", detectApiKeySource(), apiKey != null, maskKeyPrefix(apiKey), apiKey != null ? apiKey.length() : 0);
            LOGGER.debug("OpenAI Project ID source={} present={} value={}", detectProjectIdSource(), projectId != null, maskProjectId(projectId));
        }
    }

    private String resolveOpenaiApiKey() {
        if (openaiApiKey != null && !openaiApiKey.isBlank()) {
            return openaiApiKey;
        }
        if (springAiOpenaiApiKey != null && !springAiOpenaiApiKey.isBlank()) {
            return springAiOpenaiApiKey;
        }
        return null;
    }

    private String resolveOpenaiProjectId() {
        if (openaiProjectId != null && !openaiProjectId.isBlank()) {
            return openaiProjectId;
        }
        if (springAiProjectId != null && !springAiProjectId.isBlank()) {
            return springAiProjectId;
        }
        return null;
    }

    private String detectApiKeySource() {
        if (openaiApiKey != null && !openaiApiKey.isBlank()) {
            return "openai.api.key";
        }
        if (springAiOpenaiApiKey != null && !springAiOpenaiApiKey.isBlank()) {
            return "spring.ai.openai.api-key";
        }
        return "none";
    }

    private String detectProjectIdSource() {
        if (openaiProjectId != null && !openaiProjectId.isBlank()) {
            return "openai.api.project-id";
        }
        if (springAiProjectId != null && !springAiProjectId.isBlank()) {
            return "spring.ai.openai.project-id";
        }
        return "none";
    }

    private String maskKeyPrefix(String key) {
        if (key == null || key.isBlank()) {
            return "";
        }
        int prefixLen = Math.min(6, key.length());
        return key.substring(0, prefixLen) + "***";
    }

    private String maskProjectId(String proj) {
        if (proj == null || proj.isBlank()) {
            return "";
        }
        if (proj.length() <= 4) {
            return proj;
        }
        return proj.substring(0, 4) + "***";
    }

    private boolean shouldUseResponsesApi(String projectId) {
        if (openaiUseResponsesApi) {
            return true;
        }
        return projectId != null && !projectId.isBlank();
    }

    private String buildOpenAiEndpoint(String base, boolean responsesApi) {
        String normalized = base;
        if (normalized == null || normalized.isBlank()) {
            normalized = "https://api.openai.com/v1";
        } else if (!normalized.endsWith("/v1") && !normalized.contains("/v1/")) {
            normalized = normalized.endsWith("/") ? (normalized + "v1") : (normalized + "/v1");
        }
        if (!normalized.endsWith("/")) {
            normalized = normalized + "/";
        }
        return normalized + (responsesApi ? "responses" : "chat/completions");
    }

    private Map<String, Object> buildChatPayload(String message) {
        return Map.of(
                "model", openaiApiModel,
                "messages", List.of(Map.of("role", "user", "content", message)),
                "max_tokens", openaiApiMaxTokens,
                "temperature", openaiApiTemperature
        );
    }

    private Map<String, Object> buildResponsesPayload(String message) {
        return Map.of(
                "model", openaiApiModel,
                "input", List.of(
                        Map.of(
                                "role", "user",
                                "content", List.of(
                                        Map.of(
                                        "type", "input_text",
                                        "text", message
                                        )
                                )
                        )
                ),
                "max_output_tokens", openaiApiMaxTokens,
                "temperature", openaiApiTemperature
        );
    }

    private String extractChatReply(Map result) {
        if (result == null) {
            return "";
        }
        List choices = (List) result.get("choices");
        if (choices != null && !choices.isEmpty()) {
            Map first = (Map) choices.get(0);
            Map messageNode = (Map) first.get("message");
            if (messageNode != null) {
                Object content = messageNode.get("content");
                return content != null ? content.toString() : "";
            }
        }
        return "";
    }

    private String extractResponsesReply(Map result) {
        if (result == null) {
            return "";
        }
        Object outputObj = result.get("output");
        if (outputObj instanceof List<?> outputList) {
            for (Object item : outputList) {
                if (!(item instanceof Map<?, ?> outputMap)) {
                    continue;
                }
                Object contentObj = outputMap.get("content");
                if (contentObj instanceof List<?> contentList) {
                    for (Object contentItem : contentList) {
                        if (!(contentItem instanceof Map<?, ?> contentMap)) {
                            continue;
                        }
                        Object typeObj = contentMap.get("type");
                        String type = typeObj != null ? typeObj.toString() : null;
                        if ("output_text".equals(type)) {
                            Object textNode = contentMap.get("text");
                            if (textNode instanceof Map<?, ?> textMap) {
                                Object value = textMap.get("value");
                                if (value != null) {
                                    return value.toString();
                                }
                            }
                        } else if ("text".equals(type)) {
                            Object textNode = contentMap.get("text");
                            if (textNode instanceof Map<?, ?> textMap) {
                                Object value = textMap.get("value");
                                if (value != null) {
                                    return value.toString();
                                }
                            } else if (textNode != null) {
                                return textNode.toString();
                            }
                        }
                    }
                }
            }
        }
        Object outputText = result.get("output_text");
        if (outputText != null) {
            return outputText.toString();
        }
        return "";
    }
}
