package com.example.KeuanganMandiri;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@TestConfiguration
public class TestConfig {

    @Bean
    @Primary
    public ChatModel chatModel() {
        ChatModel mockChatModel = mock(ChatModel.class);
        when(mockChatModel.call(anyString())).thenReturn("Ini adalah respons AI untuk testing.");
        return mockChatModel;
    }
}
