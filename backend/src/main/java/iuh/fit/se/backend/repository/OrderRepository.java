package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    Page<Order> findAll(Specification<Order> spec, Pageable pageable);

    @Query("""
        select date(o.createdAt) as orderDate, sum(oi.price * oi.quantity) as revenue
        from Order o
        join o.orderItems oi
        where date(o.createdAt) between :startDate and :endDate
          and o.status in :statuses
        group by orderDate
        order by orderDate
        """)
    List<Object[]> sumRevenueByDayRange(@Param("startDate") LocalDate startDate,
                    @Param("endDate") LocalDate endDate,
                    @Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select year(o.createdAt) as yearValue,
           month(o.createdAt) as monthValue,
           sum(oi.price * oi.quantity) as revenue
        from Order o
        join o.orderItems oi
        where year(o.createdAt) = :year
          and o.status in :statuses
        group by yearValue, monthValue
        order by monthValue
        """)
    List<Object[]> sumRevenueByMonth(@Param("year") int year,
                     @Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select year(o.createdAt) as yearValue,
           sum(oi.price * oi.quantity) as revenue
        from Order o
        join o.orderItems oi
        where year(o.createdAt) between :startYear and :endYear
          and o.status in :statuses
        group by yearValue
        order by yearValue
        """)
    List<Object[]> sumRevenueByYearRange(@Param("startYear") int startYear,
                     @Param("endYear") int endYear,
                     @Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select coalesce(sum(oi.price * oi.quantity), 0)
        from Order o
        join o.orderItems oi
        where o.status in :statuses
        """)
    BigDecimal sumTotalRevenueByStatuses(@Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select coalesce(sum(oi.price * oi.quantity), 0)
        from Order o
        join o.orderItems oi
        where o.status in :statuses
          and o.createdAt >= :startDate
          and o.createdAt <= :endDate
        """)
    BigDecimal sumRevenueInRange(@Param("startDate") LocalDateTime startDate,
                 @Param("endDate") LocalDateTime endDate,
                 @Param("statuses") List<OrderStatus> statuses);

    @Query("select count(distinct o.id) from Order o where o.status in :statuses")
    long countByStatusIn(@Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select o.user.id,
           o.user.fullName,
           o.user.email,
           sum(oi.price * oi.quantity) as revenue,
           count(distinct o.id) as orderCount
        from Order o
        join o.orderItems oi
        where o.status in :statuses
          and year(o.createdAt) = :year
          and month(o.createdAt) = :month
        group by o.user.id, o.user.fullName, o.user.email
        order by revenue desc
        """)
    List<Object[]> sumCustomerRevenueByMonth(@Param("year") int year,
                         @Param("month") int month,
                         @Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select o.user.id,
           o.user.fullName,
           o.user.email,
           sum(oi.price * oi.quantity) as revenue,
           count(distinct o.id) as orderCount
        from Order o
        join o.orderItems oi
        where o.status in :statuses
          and year(o.createdAt) = :year
        group by o.user.id, o.user.fullName, o.user.email
        order by revenue desc
        """)
    List<Object[]> sumCustomerRevenueByYear(@Param("year") int year,
                        @Param("statuses") List<OrderStatus> statuses);
}
