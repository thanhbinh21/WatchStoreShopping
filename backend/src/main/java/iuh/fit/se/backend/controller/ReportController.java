package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.ApiResponse;
import iuh.fit.se.backend.dto.CustomerDailySignupPoint;
import iuh.fit.se.backend.dto.CustomerMonthlySignupPoint;
import iuh.fit.se.backend.dto.CustomerRevenuePoint;
import iuh.fit.se.backend.dto.CustomerSummaryReport;
import iuh.fit.se.backend.dto.CustomerYearlySignupPoint;
import iuh.fit.se.backend.dto.RevenueDailyPoint;
import iuh.fit.se.backend.dto.RevenueMonthlyPoint;
import iuh.fit.se.backend.dto.RevenueSummaryReport;
import iuh.fit.se.backend.dto.RevenueYearlyPoint;
import iuh.fit.se.backend.service.CustomerReportService;
import iuh.fit.se.backend.service.RevenueReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final CustomerReportService customerReportService;
    private final RevenueReportService revenueReportService;

    @GetMapping("/customers/summary")
    public ResponseEntity<ApiResponse<CustomerSummaryReport>> getCustomerSummary() {
        CustomerSummaryReport summary = customerReportService.getCustomerSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/customers/daily")
    public ResponseEntity<ApiResponse<List<CustomerDailySignupPoint>>> getCustomerDailyReport(
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate defaultEnd = endDate != null ? endDate : today;
            LocalDate defaultStart = startDate != null ? startDate : defaultEnd.minusDays(6);

            List<CustomerDailySignupPoint> data = customerReportService.getDailySignups(defaultStart, defaultEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/customers/monthly")
    public ResponseEntity<ApiResponse<List<CustomerMonthlySignupPoint>>> getCustomerMonthlyReport(
            @RequestParam(value = "year", required = false) Integer year
    ) {
        int targetYear = year != null ? year : Year.now().getValue();
        List<CustomerMonthlySignupPoint> data = customerReportService.getMonthlySignups(targetYear);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/customers/yearly")
    public ResponseEntity<ApiResponse<List<CustomerYearlySignupPoint>>> getCustomerYearlyReport(
            @RequestParam(value = "startYear", required = false) Integer startYear,
            @RequestParam(value = "endYear", required = false) Integer endYear
    ) {
        int currentYear = Year.now().getValue();
        int resolvedStart = startYear != null ? startYear : currentYear - 4;
        int resolvedEnd = endYear != null ? endYear : currentYear;

        try {
            List<CustomerYearlySignupPoint> data = customerReportService.getYearlySignups(resolvedStart, resolvedEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/revenue/summary")
    public ResponseEntity<ApiResponse<RevenueSummaryReport>> getRevenueSummary() {
        RevenueSummaryReport summary = revenueReportService.getRevenueSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/revenue/daily")
    public ResponseEntity<ApiResponse<List<RevenueDailyPoint>>> getRevenueDailyReport(
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate resolvedEnd = endDate != null ? endDate : today;
            LocalDate resolvedStart = startDate != null ? startDate : resolvedEnd.minusDays(6);

            List<RevenueDailyPoint> data = revenueReportService.getDailyRevenue(resolvedStart, resolvedEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<ApiResponse<List<RevenueMonthlyPoint>>> getRevenueMonthlyReport(
            @RequestParam(value = "year", required = false) Integer year
    ) {
        int targetYear = year != null ? year : Year.now().getValue();
        List<RevenueMonthlyPoint> data = revenueReportService.getMonthlyRevenue(targetYear);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/revenue/yearly")
    public ResponseEntity<ApiResponse<List<RevenueYearlyPoint>>> getRevenueYearlyReport(
            @RequestParam(value = "startYear", required = false) Integer startYear,
            @RequestParam(value = "endYear", required = false) Integer endYear
    ) {
        int currentYear = Year.now().getValue();
        int resolvedStart = startYear != null ? startYear : currentYear - 4;
        int resolvedEnd = endYear != null ? endYear : currentYear;

        try {
            List<RevenueYearlyPoint> data = revenueReportService.getYearlyRevenue(resolvedStart, resolvedEnd);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/revenue/customers/monthly")
    public ResponseEntity<ApiResponse<List<CustomerRevenuePoint>>> getCustomerRevenueMonthly(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        LocalDate today = LocalDate.now();
        int resolvedYear = year != null ? year : today.getYear();
        int resolvedMonth = month != null ? month : today.getMonthValue();
        int resolvedLimit = limit != null ? limit : 10;

        try {
            List<CustomerRevenuePoint> data = revenueReportService.getCustomerRevenueByMonth(resolvedYear, resolvedMonth, resolvedLimit);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(ex.getMessage()));
        }
    }

    @GetMapping("/revenue/customers/yearly")
    public ResponseEntity<ApiResponse<List<CustomerRevenuePoint>>> getCustomerRevenueYearly(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        int resolvedYear = year != null ? year : Year.now().getValue();
        int resolvedLimit = limit != null ? limit : 10;

        List<CustomerRevenuePoint> data = revenueReportService.getCustomerRevenueByYear(resolvedYear, resolvedLimit);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
