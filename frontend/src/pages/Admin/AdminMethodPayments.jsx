import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { getPayments, getPaymentById } from "@/api/paymentAPI";
import { PaymentHeader } from "@/components/Admin/payments/PaymentHeader";
import { PaymentToolbar } from "@/components/Admin/payments/PaymentToolbar";
import { PaymentTable } from "@/components/Admin/payments/PaymentTable";
import { PaymentDetailCard } from "@/components/Admin/payments/PaymentDetailCard";
import { getPaymentMethodLabel } from "@/lib/payment";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

const formatDateTime = (value) => {
  if (!value) {
    return "--";
  }
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
};

/**
 * Admin Payment Transaction History - View Only
 * Displays payment transaction history from orders
 * Shows completed payments with order details
 */
export const AdminMethodPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const fetchPayments = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await getPayments({
          search: searchKeyword || undefined,
        });
        const list = Array.isArray(data) ? data : [];
        setPayments(list);

        if (list.length === 0) {
          setSelectedPaymentId(null);
        } else {
          setSelectedPaymentId((prev) => {
            if (prev && list.some((item) => item.id === prev)) {
              return prev;
            }
            return list[0].id;
          });
        }
      } catch (error) {
        console.error("Failed to load payments", error);
        const message =
          error.response?.data?.message ||
          error.response?.data?.data ||
          "Không thể tải danh sách thanh toán";
        toast.error(message);
        setPayments([]);
        setSelectedPaymentId(null);
      } finally {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [searchKeyword]
  );

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalAmountLabel = useMemo(() => {
    const total = payments.reduce(
      (sum, payment) => sum + Number(payment.amount ?? 0),
      0
    );
    return formatCurrency(total);
  }, [payments]);

  const selectedPayment = useMemo(
    () => payments.find((item) => item.id === selectedPaymentId) || null,
    [payments, selectedPaymentId]
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchKeyword(searchInput.trim());
  };

  const handleRefresh = () => {
    fetchPayments({ silent: true });
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPaymentId(paymentId);
  };

  return (
    <div className="space-y-6">
      <PaymentHeader
        totalPayments={payments.length}
        totalAmountLabel={totalAmountLabel}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        viewOnly={true}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <Card className="p-6">
          <PaymentToolbar
            searchValue={searchInput}
            onSearchChange={(event) => setSearchInput(event.target.value)}
            onSubmit={handleSearchSubmit}
          />

          <PaymentTable
            payments={payments}
            loading={loading}
            selectedPaymentId={selectedPaymentId}
            onSelect={handleSelectPayment}
            formatDateTime={formatDateTime}
            formatCurrency={formatCurrency}
            getMethodLabel={getPaymentMethodLabel}
            viewOnly={true}
          />
        </Card>

        <PaymentDetailCard
          payment={selectedPayment}
          getMethodLabel={getPaymentMethodLabel}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
          viewOnly={true}
        />
      </div>
    </div>
  );
};
