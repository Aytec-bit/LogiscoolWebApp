package com.logiscool.logiscooleventwebsite.infrastructure.config;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.stereotype.Component;
import tools.jackson.databind.cfg.DateTimeFeature;
import tools.jackson.databind.json.JsonMapper;

@Component
public class JacksonConfig implements JsonMapperBuilderCustomizer {

    @Override
    public void customize(JsonMapper.Builder builder) {
        builder.disable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
