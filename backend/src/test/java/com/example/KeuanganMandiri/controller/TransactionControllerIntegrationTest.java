package com.example.KeuanganMandiri.controller;

import com.example.KeuanganMandiri.dto.auth.RegisterRequest;
import com.example.KeuanganMandiri.dto.transaction.TransactionRequest;
import com.example.KeuanganMandiri.repository.TransactionRepository;
import com.example.KeuanganMandiri.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(com.example.KeuanganMandiri.TestConfig.class)
class TransactionControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private TransactionRepository transactionRepository;

    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        transactionRepository.deleteAll();
        userRepository.deleteAll();

        // Register a user and get token
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Transaction User");
        reg.setEmail("tx@example.com");
        reg.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        authToken = json.get("token").asText();
    }

    @Test
    void createTransaction_shouldSucceed() throws Exception {
        TransactionRequest request = new TransactionRequest();
        request.setType("income");
        request.setAmount(new BigDecimal("500000"));
        request.setDescription("Gaji bulanan");
        request.setDate(LocalDate.of(2026, 4, 1));

        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.type").value("income"))
                .andExpect(jsonPath("$.amount").value(500000))
                .andExpect(jsonPath("$.description").value("Gaji bulanan"));
    }

    @Test
    void getTransactions_shouldReturnList() throws Exception {
        // Create two transactions
        createTestTransaction("income", "50000", "Pemasukan");
        createTestTransaction("expense", "20000", "Makan");

        mockMvc.perform(get("/api/transactions")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void updateTransaction_shouldSucceed() throws Exception {
        // Create
        MvcResult createResult = createTestTransaction("expense", "10000", "Kopi");
        JsonNode created = objectMapper.readTree(createResult.getResponse().getContentAsString());
        Long id = created.get("id").asLong();

        // Update
        TransactionRequest updateReq = new TransactionRequest();
        updateReq.setType("expense");
        updateReq.setAmount(new BigDecimal("15000"));
        updateReq.setDescription("Kopi + snack");
        updateReq.setDate(LocalDate.now());

        mockMvc.perform(put("/api/transactions/" + id)
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(15000))
                .andExpect(jsonPath("$.description").value("Kopi + snack"));
    }

    @Test
    void deleteTransaction_shouldSucceed() throws Exception {
        MvcResult createResult = createTestTransaction("expense", "5000", "Parkir");
        JsonNode created = objectMapper.readTree(createResult.getResponse().getContentAsString());
        Long id = created.get("id").asLong();

        mockMvc.perform(delete("/api/transactions/" + id)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNoContent());

        // Verify deleted
        mockMvc.perform(get("/api/transactions/" + id)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void createTransaction_shouldRejectInvalidType() throws Exception {
        TransactionRequest request = new TransactionRequest();
        request.setType("invalid");
        request.setAmount(new BigDecimal("1000"));
        request.setDate(LocalDate.now());

        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    private MvcResult createTestTransaction(String type, String amount, String desc) throws Exception {
        TransactionRequest request = new TransactionRequest();
        request.setType(type);
        request.setAmount(new BigDecimal(amount));
        request.setDescription(desc);
        request.setDate(LocalDate.now());

        return mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
    }
}
