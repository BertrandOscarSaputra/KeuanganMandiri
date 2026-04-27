package com.example.KeuanganMandiri.service;

import com.example.KeuanganMandiri.dto.analytics.DashboardResponse;
import com.example.KeuanganMandiri.model.Transaction;
import com.example.KeuanganMandiri.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final TransactionRepository transactionRepo;

    public AnalyticsService(TransactionRepository transactionRepo) {
        this.transactionRepo = transactionRepo;
    }

    public DashboardResponse getDashboard(Long userId) {
        BigDecimal totalIncome = transactionRepo.getTotalIncome(userId);
        BigDecimal totalExpense = transactionRepo.getTotalExpense(userId);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        List<DashboardResponse.MonthlyData> monthlyData = getMonthlyData(userId);

        DashboardResponse response = new DashboardResponse();
        response.setTotalIncome(totalIncome);
        response.setTotalExpense(totalExpense);
        response.setBalance(balance);
        response.setMonthlyData(monthlyData);
        return response;
    }

    private List<DashboardResponse.MonthlyData> getMonthlyData(Long userId) {
        // Get transactions for last 6 months
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6).withDayOfMonth(1);
        List<Transaction> transactions = transactionRepo.findByUserIdAndDateBetween(
                userId, sixMonthsAgo, LocalDate.now());

        // Group by month
        Map<YearMonth, List<Transaction>> grouped = transactions.stream()
                .collect(Collectors.groupingBy(t -> YearMonth.from(t.getDate())));

        // Build monthly data sorted by month
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        List<DashboardResponse.MonthlyData> monthlyData = new ArrayList<>();

        // Ensure all 6 months are represented
        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            List<Transaction> monthTransactions = grouped.getOrDefault(month, List.of());

            BigDecimal income = monthTransactions.stream()
                    .filter(t -> "income".equals(t.getType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal expense = monthTransactions.stream()
                    .filter(t -> "expense".equals(t.getType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            monthlyData.add(new DashboardResponse.MonthlyData(month.format(formatter), income, expense));
        }

        return monthlyData;
    }
}
