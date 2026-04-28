package com.example.KeuanganMandiri.service;

import com.example.KeuanganMandiri.dto.chat.ChatResponse;
import com.example.KeuanganMandiri.model.ChatMessage;
import com.example.KeuanganMandiri.model.Transaction;
import com.example.KeuanganMandiri.repository.ChatMessageRepository;
import com.example.KeuanganMandiri.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatModel chatModel;
    private final ChatMessageRepository chatMessageRepo;
    private final TransactionRepository transactionRepo;

    public ChatService(ChatModel chatModel,
                       ChatMessageRepository chatMessageRepo,
                       TransactionRepository transactionRepo) {
        this.chatModel = chatModel;
        this.chatMessageRepo = chatMessageRepo;
        this.transactionRepo = transactionRepo;
    }

    /**
     * Database-aware AI chat: queries real financial data and includes it in the AI prompt.
     */
    public ChatResponse chat(Long userId, String message) {
        saveChatMessage(userId, message, "user");

        String dbContext = buildDatabaseContext(userId, message);
        String prompt = buildPrompt(message, dbContext);

        String aiResponse;
        try {
            aiResponse = chatModel.call(prompt);
        } catch (Exception e) {
            log.error("AI call failed", e);
            aiResponse = "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.";
        }

        ChatMessage saved = saveChatMessage(userId, aiResponse, "ai");
        return new ChatResponse(saved.getId(), aiResponse, "ai", saved.getCreatedAt());
    }

    /**
     * Get financial recommendations based on real transaction data.
     */
    public String getRecommendation(Long userId) {
        String context = getFullFinancialContext(userId);
        String prompt = """
                Kamu adalah asisten keuangan pribadi AI. Berdasarkan data keuangan pengguna berikut:
                
                %s
                
                Berikan 3-5 rekomendasi pengelolaan keuangan pribadi yang spesifik dan actionable.
                Fokus pada: penghematan, budgeting, dana darurat, dan perencanaan keuangan.
                Gunakan bahasa Indonesia yang natural dan mudah dipahami.
                """.formatted(context);

        try {
            return chatModel.call(prompt);
        } catch (Exception e) {
            log.error("AI recommendation failed", e);
            return "Maaf, tidak dapat menghasilkan rekomendasi saat ini.";
        }
    }

    /**
     * Analyze personal spending patterns from real data.
     */
    public String getAnalysis(Long userId) {
        String context = getFullFinancialContext(userId);
        String prompt = """
                Kamu adalah analis keuangan pribadi AI. Analisis data keuangan pengguna berikut:
                
                %s
                
                Berikan analisis mendalam tentang:
                1. Pola pengeluaran — kategori mana yang paling besar?
                2. Rasio pemasukan vs pengeluaran — apakah sehat?
                3. Tren yang perlu diperhatikan
                4. Saran pengelolaan keuangan pribadi
                
                Gunakan bahasa Indonesia yang natural.
                """.formatted(context);

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

        // Include category breakdown
        context.append("\n").append(getCategoryBreakdown(userId));

        // Include recent transactions if asking about specific spending
        String lowerMsg = message.toLowerCase();
        if (lowerMsg.contains("transaksi") || lowerMsg.contains("pengeluaran") || lowerMsg.contains("pemasukan")
                || lowerMsg.contains("belanja") || lowerMsg.contains("beli") || lowerMsg.contains("bayar")
                || lowerMsg.contains("terakhir") || lowerMsg.contains("riwayat") || lowerMsg.contains("detail")) {
            context.append("\n").append(getRecentTransactions(userId));
        }

        return context.toString();
    }

    private String buildPrompt(String userMessage, String dbContext) {
        return """
                Kamu adalah asisten keuangan pribadi AI bernama "Keuangan Mandiri AI".
                Tugasmu adalah membantu pengguna mengelola keuangan pribadi berdasarkan DATA REAL dari database mereka.
                
                ATURAN PENTING:
                - Selalu jawab berdasarkan data yang diberikan, BUKAN jawaban generik
                - Jika data tidak tersedia, katakan dengan jujur
                - Gunakan bahasa Indonesia yang natural dan ramah
                - Berikan angka yang akurat sesuai data
                - Fokus pada keuangan pribadi: pemasukan, pengeluaran, tabungan, budgeting
                
                === DATA KEUANGAN PENGGUNA ===
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

        BigDecimal savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? balance.multiply(BigDecimal.valueOf(100)).divide(totalIncome, 1, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return """
                [Ringkasan Keuangan]
                - Total Pemasukan: Rp %s
                - Total Pengeluaran: Rp %s
                - Saldo/Sisa: Rp %s
                - Rasio Tabungan: %s%%
                - Jumlah Transaksi: %d
                """.formatted(totalIncome, totalExpense, balance, savingsRate, transactions.size());
    }

    private String getCategoryBreakdown(Long userId) {
        List<Transaction> transactions = transactionRepo.findByUserId(userId);
        if (transactions.isEmpty()) {
            return "[Rincian Kategori] Belum ada transaksi.";
        }

        // Group expenses by description (as proxy for category)
        Map<String, BigDecimal> expenseByDesc = transactions.stream()
                .filter(t -> "expense".equals(t.getType()))
                .collect(Collectors.groupingBy(
                        t -> t.getDescription() != null ? t.getDescription() : "Lainnya",
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

        Map<String, BigDecimal> incomeByDesc = transactions.stream()
                .filter(t -> "income".equals(t.getType()))
                .collect(Collectors.groupingBy(
                        t -> t.getDescription() != null ? t.getDescription() : "Lainnya",
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

        StringBuilder sb = new StringBuilder("[Rincian Pengeluaran]\n");
        expenseByDesc.forEach((desc, amount) ->
                sb.append("- %s: Rp %s\n".formatted(desc, amount)));

        if (!incomeByDesc.isEmpty()) {
            sb.append("\n[Rincian Pemasukan]\n");
            incomeByDesc.forEach((desc, amount) ->
                    sb.append("- %s: Rp %s\n".formatted(desc, amount)));
        }

        return sb.toString();
    }

    private String getFullFinancialContext(Long userId) {
        return getFinancialSummary(userId) + "\n" +
                getCategoryBreakdown(userId) + "\n" +
                getRecentTransactions(userId);
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
            sb.append("- %s | %s | Rp %s | %s\n".formatted(
                    t.getDate(), t.getType(), t.getAmount(),
                    t.getDescription() != null ? t.getDescription() : "-"));
            count++;
        }
        return sb.toString();
    }
}