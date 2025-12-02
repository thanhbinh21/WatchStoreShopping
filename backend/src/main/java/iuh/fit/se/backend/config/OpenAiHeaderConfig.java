package iuh.fit.se.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.boot.web.client.RestTemplateCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OpenAiHeaderConfig {

    @Value("${openai.api.project-id:${spring.ai.openai.project-id:}}")
    private String configuredProjectId;

    @Bean
    public RestTemplateCustomizer openAiHeaders() {
        return restTemplate -> restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("OpenAI-Beta", "responses=v1");
            String projectId = resolveProjectId();
            if (StringUtils.hasText(projectId)) {
                request.getHeaders().add("OpenAI-Project", projectId.trim());
            }
            return execution.execute(request, body);
        });
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }

    private String resolveProjectId() {
        if (StringUtils.hasText(configuredProjectId)) {
            return configuredProjectId;
        }
        String envProjectId = System.getenv("OPENAI_PROJECT_ID");
        return StringUtils.hasText(envProjectId) ? envProjectId : null;
    }
}
