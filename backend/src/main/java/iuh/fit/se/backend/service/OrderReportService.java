package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.OrderDailyPoint;
import iuh.fit.se.backend.dto.OrderMonthlyPoint;
import iuh.fit.se.backend.dto.OrderSummaryReport;
import iuh.fit.se.backend.dto.OrderYearlyPoint;

import java.time.LocalDate;
import java.util.List;

public interface OrderReportService {

    OrderSummaryReport getOrderSummary();

    List<OrderDailyPoint> getDailyOrders(LocalDate startDate, LocalDate endDate);

    List<OrderMonthlyPoint> getMonthlyOrders(int year);

    List<OrderYearlyPoint> getYearlyOrders(int startYear, int endYear);
}
