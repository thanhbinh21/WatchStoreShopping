import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

export const PaymentHeader = ({
  totalPayments,
  totalAmountLabel,
  loading,
  refreshing,
  onRefresh,
  onAdd,
}) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h1 className="text-2xl font-semibold">Quản lý phương thức thanh toán</h1>
      <p className="text-sm text-muted-foreground">
        Theo dõi giao dịch, thêm phương thức thanh toán cho đơn hàng và xem chi
        tiết từng khoản.
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">Tổng: {totalPayments}</Badge>
      <Badge variant="outline">Tổng giá trị: {totalAmountLabel}</Badge>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={loading || refreshing}
      >
        <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
      </Button>
      <Button
        onClick={onAdd}
        className={
          "bg-brand-primary hover:bg-brand-primary-soft cursor-pointer"
        }
      >
        <Plus className="mr-2 h-4 w-4" /> Thêm thanh toán
      </Button>
    </div>
  </div>
);
