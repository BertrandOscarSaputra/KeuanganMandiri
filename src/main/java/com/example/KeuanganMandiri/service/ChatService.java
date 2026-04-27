package com.example.KeuanganMandiri.service;

import com.example.KeuanganMandiri.dto.chat.ChatResponse;
import com.example.KeuanganMandiri.model.ChatMessage;
import com.example.KeuanganMandiri.model.Product;
import com.example.KeuanganMandiri.model.Transaction;
import com.example.KeuanganMandiri.repository.ChatMessageRepository;
import com.example.KeuanganMandiri.repository.ProductRepository;
import com.example.KeuanganMandiri.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatModel chatModel;
    private final ChatMessageRepository chatMessageRepo;
    private final TransactionRepository transactionRepo;
    private final ProductRepository productRepo;

    public ChatService(ChatModel chatModel,
                       ChatMessageRepository chatMessageRepo,
                       TransactionRepository transactionRepo,
                       ProductRepository productRepo) {
        this.chatModel = chatModel;
        this.chatMessageRepo = chatMessageRepo;
        this.transactionRepo = transactionRepo;
        this.productRepo = productRepo;
    }

    /**
     * Database-aware AI chat: queries real data and includes it in the AI prompt.
     */
    public ChatResponse chat(Long userId, String message) {
        // 1. Save user message
        saveChatMessage(userId, message, "user");

        // 2. Build context from database
        String dbContext = buildDatabaseContext(userId, message);

        // 3. Build AI prompt with real data context
        String prompt = buildPrompt(message, dbContext);

        // 4. Call AI
        String aiResponse;
        try {
            aiResponse = chatModel.call(prompt);
        } catch (Exception e) {
            log.error("AI call failed", e);
            aiResponse = "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.";
        }

        // 5. Save AI response
        ChatMessage saved = saveChatMessage(userId, aiResponse, "ai");

        return new ChatResponse(saved.getId(), aiResponse, "ai", saved.getCreatedAt());
    }

    /**
     * Get financial recommendations based on real transaction data.
     */
    public String getRecommendation(Long userId) {
        String financialSummary = getFinancialSummary(userId);
        String prompt = """
                Kamu adalah asisten keuangan AI. Berdasarkan data keuangan pengguna berikut:
                
                %s
                
                Berikan 3-5 rekomendasi penghematan atau peningkatan keuangan yang spesifik dan actionable.
                Gunakan bahasa Indonesia yang natural dan mudah dipahami.
                """.formatted(financialSummary);

        try {
            return chatModel.call(prompt);
        } catch (Exception e) {
            log.error("AI recommendation failed", e);
            return "Maaf, tidak dapat menghasilkan rekomendasi saat ini.";
        }
    }

    /**
     * Analyze spending patterns from real data.
     */
    public String getAnalysis(Long userId) {
        String financialSummary = getFinancialSummary(userId);
        String productSummary = getProductSummary(userId);

        String prompt = """
                Kamu adalah analis keuangan AI. Analisis data keuangan dan produk pengguna berikut:
                
                === DATA KEUANGAN ===
                %s
                
                === DATA PRODUK ===
                %s
                
                Berikan analisis mendalam tentang:
                1. Pola pengeluaran
                2. Performa produk (jika ada)
                3. Tren yang perlu diperhatikan
                4. Saran perbaikan
                
                Gunakan bahasa Indonesia yang natural.
                """.formatted(financialSummary, productSummary);

        try {
            return chatModel.call(prompt);
        } catch (Exception e) {
            log.error("AI analysis failed", e);
            return "Maaf, tidak dapat menghasilkan analisis saat ini.";
        }
    }

    /**
     * Get chat history for a user.
     */
    public List<ChatResponse> getChatHistory(Long userId) {
        return chatMessageRepo.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(msg -> new ChatResponse(msg.getId(), msg.getMessage(), msg.getRole(), msg.getCreatedAt()))
                .collect(Collectors.toList());
    }

    // ===== Private Helpers =====

    private ChatMessage saveChatMessage(Long userId, String message, String role) {
        ChatMessage chatMsg = new ChatMessage(userId, message, role);
        return chatMessageRepo.save(chatMsg);
    }

    private String buildDatabaseContext(Long userId, String message) {
        StringBuilder context = new StringBuilder();

        // Always include financial summary
        context.append(getFinancialSummary(userId));

        // Include product data if the message mentions products/stock
        String lowerMsg = message.toLowerCase();
        if (lowerMsg.contains("stok") || lowerMsg.contains("produk") || lowerMsg.contains("product")
                || lowerMsg.contains("barang") || lowerMsg.contains("harga")) {
            context.append("\n").append(getProductSummary(userId));

            // Try to find specific product mentioned
            context.append("\n").append(searchProductContext(userId, message));
        }

        // Include recent transactions if asking about transactions
        if (lowerMsg.contains("transaksi") || lowerMsg.contains("pengeluaran") || lowerMsg.contains("pemasukan")
                || lowerMsg.contains("belanja") || lowerMsg.contains("beli") || lowerMsg.contains("bayar")) {
            context.append("\n").append(getRecentTransactions(userId));
        }

        return context.toString();
    }

    private String buildPrompt(String userMessage, String dbContext) {
        return """
                Kamu adalah asisten keuangan AI bernama "Keuangan Mandiri AI".
                Tugasmu adalah menjawab pertanyaan pengguna berdasarkan DATA REAL dari database mereka.
                
                ATURAN PENTING:
                - Selalu jawab berdasarkan data yang diberikan, BUKAN jawaban generik
                - Jika data tidak tersedia, katakan dengan jujur
                - Gunakan bahasa Indonesia yang natural dan ramah
                - Berikan angka yang akurat sesuai data
                
                === DATA PENGGUNA DARI DATABASE ===
                %s
                
                === PERTANYAAN PENGGUNA ===
                %s
                
                Jawab dengan natural berdasarkan data di atas:
                """.formatted(dbContext, userMessage);
    }

    private String getFinancialSummary(Long userId) {
        BigDecimal totalIncome = transactionRepo.getTotalIncome(userId);
        BigDecimal totalExpense = transactionRepo.getTotalExpense(userId);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        List<Transaction> transactions = transactionRepo.findByUserId(userId);

        return """
                [Ringkasan Keuangan]
                - Total Pemasukan: Rp %s
                - Total Pengeluaran: Rp %s
                - Saldo/Balance: Rp %s
                - Jumlah Transaksi: %d
                """.formatted(totalIncome, totalExpense, balance, transactions.size());
    }

    private String getProductSummary(Long userId) {
        List<Product> products = productRepo.findByUserId(userId);
        if (products.isEmpty()) {
            return "[Data Produk] Belum ada produk yang terdaftar.";
        }

        StringBuilder sb = new StringBuilder("[Data Produk]\n");
        for (Product p : products) {
            sb.append("- %s: stok %d unit, harga Rp %s\n".formatted(p.getName(), p.getStock(), p.getPrice()));
        }
        return sb.toString();
    }

    private String searchProductContext(Long userId, String message) {
        // Extract potential product name from message
        List<Product> products = productRepo.findByUserId(userId);
        StringBuilder sb = new StringBuilder();

        for (Product p : products) {
            if (message.toLowerCase().contains(p.getName().toLowerCase())) {
                sb.append("[Produk Ditemukan] %s — stok: %d unit, harga: Rp %s\n"
                        .formatted(p.getName(), p.getStock(), p.getPrice()));
            }
        }

        return sb.toString();
    }

    private String getRecentTransactions(Long userId) {
        List<Transaction> recent = transactionRepo.findByUserIdOrderByDateDesc(userId);
        if (recent.isEmpty()) {
            return "[Transaksi Terbaru] Belum ada transaksi.";
        }

        StringBuilder sb = new StringBuilder("[Transaksi Terbaru (maks 10)]\n");
        int count = 0;
        for (Transaction t : recent) {
            if (count >= 10) break;
            sb.append("- %s | %s | Rp %s | %s | %s\n".formatted(
                    t.getDate(), t.getType(), t.getAmount(),
                    t.getDescription() != null ? t.getDescription() : "-",
                    t.getType()));
            count++;
        }
        return sb.toString();
    }
}