import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
    getPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentMethods,
} from "@/api/paymentAPI";
import { searchOrders } from "@/api/orderAPI";
import { PaymentHeader } from "@/components/Admin/payments/PaymentHeader";
import { PaymentToolbar } from "@/components/Admin/payments/PaymentToolbar";
import { PaymentTable } from "@/components/Admin/payments/PaymentTable";
import { PaymentDetailCard } from "@/components/Admin/payments/PaymentDetailCard";
import { PaymentFormDialog } from "@/components/Admin/payments/PaymentFormDialog";
import { PaymentDeleteDialog } from "@/components/Admin/payments/PaymentDeleteDialog";
import { getPaymentMethodLabel } from "@/lib/payment";

const EMPTY_FORM = {
    method: "",
    amount: "",
    orderId: "",
};

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

export const AdminMethodPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    const [selectedPaymentId, setSelectedPaymentId] = useState(null);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [formInitialData, setFormInitialData] = useState(EMPTY_FORM);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [editingPaymentId, setEditingPaymentId] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

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

    const fetchPaymentMethods = useCallback(async () => {
        try {
            const methods = await getPaymentMethods();
            setPaymentMethods(Array.isArray(methods) ? methods : []);
        } catch (error) {
            console.error("Failed to load payment methods", error);
            toast.error("Không thể tải danh sách phương thức thanh toán");
            setPaymentMethods([]);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true);
        try {
            const response = await searchOrders({
                page: 0,
                size: 50,
                sortBy: "createdAt",
                sortDir: "desc",
            });
            const list = Array.isArray(response?.content)
                ? response.content
                : [];
            setOrders(list);
        } catch (error) {
            console.error("Failed to load orders", error);
            toast.error("Không thể tải danh sách đơn hàng");
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    useEffect(() => {
        fetchPaymentMethods();
        fetchOrders();
    }, [fetchPaymentMethods, fetchOrders]);

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

    const handleOpenCreate = () => {
        setFormMode("create");
        setEditingPaymentId(null);
        setFormInitialData(EMPTY_FORM);
        setFormOpen(true);
    };

    const handleEditPayment = async (paymentId) => {
        try {
            const detail = await getPaymentById(paymentId);
            if (!detail) {
                toast.error("Không tìm thấy thông tin thanh toán");
                return;
            }

            setFormMode("edit");
            setEditingPaymentId(paymentId);
            setFormInitialData({
                method: detail.method || "",
                amount: detail.amount ?? "",
                orderId: detail.orderId ?? "",
            });
            setFormOpen(true);
        } catch (error) {
            console.error("Failed to load payment detail", error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.data ||
                "Không thể tải chi tiết thanh toán";
            toast.error(message);
        }
    };

    const handleFormSubmit = async (payload) => {
        setFormSubmitting(true);
        const requestBody = {
            method: payload.method,
            amount: payload.amount,
            orderId: payload.orderId,
        };

        try {
            let response;
            if (formMode === "edit" && editingPaymentId) {
                response = await updatePayment(editingPaymentId, requestBody);
            } else {
                response = await createPayment(requestBody);
            }

            const message = response?.data || "Thao tác thành công";
            toast.success(message);
            setFormOpen(false);
            setEditingPaymentId(null);
            fetchPayments({ silent: true });
        } catch (error) {
            console.error("Failed to submit payment", error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.data ||
                "Không thể lưu thanh toán";
            toast.error(message);
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDeletePayment = (payment) => {
        setPaymentToDelete(payment);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!paymentToDelete) {
            return;
        }
        setDeleting(true);
        try {
            const response = await deletePayment(paymentToDelete.id);
            const message = response?.data || "Đã xóa thanh toán";
            toast.success(message);
            setDeleteDialogOpen(false);
            setPaymentToDelete(null);
            fetchPayments({ silent: true });
        } catch (error) {
            console.error("Failed to delete payment", error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.data ||
                "Không thể xóa thanh toán";
            toast.error(message);
        } finally {
            setDeleting(false);
        }
    };

    const handleFormOpenChange = (open) => {
        if (!open) {
            setFormOpen(false);
            setFormSubmitting(false);
            setEditingPaymentId(null);
        } else {
            setFormOpen(true);
        }
    };

    const handleDeleteDialogOpenChange = (open) => {
        if (!open) {
            setDeleteDialogOpen(false);
            setPaymentToDelete(null);
        } else {
            setDeleteDialogOpen(true);
        }
    };

    return (
        <div className="space-y-6">
            <PaymentHeader
                totalPayments={payments.length}
                totalAmountLabel={totalAmountLabel}
                loading={loading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onAdd={handleOpenCreate}
            />

            <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
                <Card className="p-6">
                    <PaymentToolbar
                        searchValue={searchInput}
                        onSearchChange={(event) =>
                            setSearchInput(event.target.value)
                        }
                        onSubmit={handleSearchSubmit}
                    />

                    <PaymentTable
                        payments={payments}
                        loading={loading}
                        selectedPaymentId={selectedPaymentId}
                        onSelect={handleSelectPayment}
                        onEdit={handleEditPayment}
                        onDelete={handleDeletePayment}
                        formatDateTime={formatDateTime}
                        formatCurrency={formatCurrency}
                        getMethodLabel={getPaymentMethodLabel}
                    />
                </Card>

                <PaymentDetailCard
                    payment={selectedPayment}
                    getMethodLabel={getPaymentMethodLabel}
                    formatCurrency={formatCurrency}
                    formatDateTime={formatDateTime}
                    onEdit={handleEditPayment}
                    onDelete={handleDeletePayment}
                />
            </div>

            <PaymentFormDialog
                open={formOpen}
                mode={formMode}
                initialData={formInitialData}
                methods={paymentMethods}
                orders={orders}
                loadingOrders={loadingOrders}
                submitting={formSubmitting}
                onOpenChange={handleFormOpenChange}
                onSubmit={handleFormSubmit}
                onCancel={() => handleFormOpenChange(false)}
            />

            <PaymentDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={handleDeleteDialogOpenChange}
                payment={paymentToDelete}
                onCancel={() => handleDeleteDialogOpenChange(false)}
                onConfirm={handleConfirmDelete}
                deleting={deleting}
            />
        </div>
    );
};
