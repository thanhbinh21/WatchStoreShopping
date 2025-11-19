import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllReviews, deleteReview } from "@/api/reviewAPI";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Loader2,
    RefreshCw,
    Search,
    Trash2,
    MessageSquareText,
    Star,
} from "lucide-react";

const RATING_OPTIONS = [
    { value: "ALL", label: "Tất cả" },
    { value: "5", label: "5 sao" },
    { value: "4", label: "4 sao" },
    { value: "3", label: "3 sao" },
    { value: "2", label: "2 sao" },
    { value: "1", label: "1 sao" },
];

const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "--";

export const AdminReview = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filters, setFilters] = useState({ rating: "ALL", search: "" });
    const [searchInput, setSearchInput] = useState("");
    const [selectedReviewId, setSelectedReviewId] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [deleteReason, setDeleteReason] = useState("");
    const [deleting, setDeleting] = useState(false);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllReviews();
            const list = Array.isArray(data) ? data : [];
            setReviews(list);
            if (list.length > 0) {
                setSelectedReviewId((prev) => prev ?? list[0].id);
            } else {
                setSelectedReviewId(null);
            }
        } catch (error) {
            console.error("Failed to load reviews", error);
            const message =
                error.response?.data?.message ||
                "Không thể tải danh sách đánh giá";
            toast.error(message);
            setReviews([]);
            setSelectedReviewId(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const filteredReviews = useMemo(() => {
        return reviews.filter((review) => {
            const matchesRating =
                filters.rating === "ALL" ||
                String(review.rating) === filters.rating;
            const term = filters.search.trim().toLowerCase();
            if (!term) return matchesRating;
            const productName = review.productName || "";
            const userName = review.userFullName || review.username || "";
            const comment = review.comment || "";
            const matchesSearch = [productName, userName, comment]
                .join(" ")
                .toLowerCase()
                .includes(term);
            return matchesRating && matchesSearch;
        });
    }, [reviews, filters]);

    useEffect(() => {
        if (filteredReviews.length === 0) {
            setSelectedReviewId(null);
            return;
        }

        setSelectedReviewId((prev) => {
            if (prev && filteredReviews.some((review) => review.id === prev)) {
                return prev;
            }
            return filteredReviews[0].id;
        });
    }, [filteredReviews]);

    const selectedReview = useMemo(
        () =>
            filteredReviews.find((review) => review.id === selectedReviewId) ||
            null,
        [filteredReviews, selectedReviewId]
    );

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    };

    const handleRatingChange = (event) => {
        setFilters((prev) => ({ ...prev, rating: event.target.value }));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchReviews();
        setRefreshing(false);
    };

    const handleSelectReview = (reviewId) => {
        setSelectedReviewId(reviewId);
    };

    const openDeleteDialog = (review) => {
        setReviewToDelete(review);
        setDeleteReason("");
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        if (deleting) return;
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
        setDeleteReason("");
    };

    const handleDelete = async () => {
        if (!reviewToDelete) return;
        if (!deleteReason.trim()) {
            toast.error("Vui lòng nhập lý do xóa đánh giá");
            return;
        }

        setDeleting(true);
        try {
            await deleteReview(reviewToDelete.id, deleteReason.trim());
            toast.success("Đã xóa đánh giá thành công");
            setReviews((prev) =>
                prev.filter((review) => review.id !== reviewToDelete.id)
            );
            closeDeleteDialog();
        } catch (error) {
            console.error("Failed to delete review", error);
            const message =
                error.response?.data?.message ||
                "Không thể xóa đánh giá. Vui lòng thử lại.";
            toast.error(message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Quản lý đánh giá</h1>
                    <p className="text-sm text-muted-foreground">
                        Giám sát phản hồi của khách hàng và xử lý các đánh giá
                        không phù hợp.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">Tổng: {reviews.length}</Badge>
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={loading || refreshing}
                    >
                        <RefreshCw className="mr-2 size-4" /> Làm mới
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
                <Card className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex w-full gap-2 md:max-w-md"
                        >
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchInput}
                                    onChange={(event) =>
                                        setSearchInput(event.target.value)
                                    }
                                    placeholder="Tìm theo sản phẩm, người dùng hoặc bình luận"
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit">Tìm kiếm</Button>
                        </form>

                        <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground">
                                Đánh giá
                            </label>
                            <select
                                value={filters.rating}
                                onChange={handleRatingChange}
                                className="h-9 rounded-md border px-3 text-sm shadow-sm"
                            >
                                {RATING_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-lg border">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead className="bg-muted/60">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Sản phẩm
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Người dùng
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Đánh giá
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Bình luận
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Thời gian
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            <Loader2 className="mx-auto size-6 animate-spin" />
                                            <p className="mt-2 text-sm">
                                                Đang tải đánh giá...
                                            </p>
                                        </td>
                                    </tr>
                                ) : filteredReviews.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            Không có đánh giá nào phù hợp
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReviews.map((review) => {
                                        const isActive =
                                            review.id === selectedReviewId;
                                        return (
                                            <tr
                                                key={review.id}
                                                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                                    isActive
                                                        ? "bg-muted/40"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleSelectReview(
                                                        review.id
                                                    )
                                                }
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-foreground">
                                                        {review.productName ||
                                                            `Sản phẩm #${review.productId}`}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        ID:{" "}
                                                        {review.productId ??
                                                            "--"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">
                                                        {review.userFullName ||
                                                            review.username ||
                                                            "Người dùng"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {review.userEmail ||
                                                            "--"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Badge
                                                        variant="outline"
                                                        className="font-semibold"
                                                    >
                                                        {review.rating}/5
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 max-w-lg">
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {review.comment ||
                                                            "(Không có bình luận)"}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                                                    <div>
                                                        {formatDateTime(
                                                            review.createdAt
                                                        )}
                                                    </div>
                                                    {review.updatedAt &&
                                                    review.updatedAt !==
                                                        review.createdAt ? (
                                                        <div>
                                                            Cập nhật:{" "}
                                                            {formatDateTime(
                                                                review.updatedAt
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            openDeleteDialog(
                                                                review
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="mr-1 size-4" />{" "}
                                                        Xóa
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card className="h-fit p-6">
                    <h2 className="text-lg font-semibold">Chi tiết đánh giá</h2>
                    {!selectedReview ? (
                        <div className="mt-6 text-sm text-muted-foreground">
                            Chọn một đánh giá trong danh sách để xem chi tiết.
                        </div>
                    ) : (
                        <div className="mt-6 space-y-5">
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Sản phẩm
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {selectedReview.productName ||
                                                `Sản phẩm #${selectedReview.productId}`}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="flex items-center gap-1 text-base"
                                    >
                                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                        {selectedReview.rating}/5
                                    </Badge>
                                </div>
                                <div className="mt-3 text-sm text-muted-foreground">
                                    <p>
                                        Người dùng:{" "}
                                        <span className="font-medium text-foreground">
                                            {selectedReview.userFullName ||
                                                selectedReview.username ||
                                                "--"}
                                        </span>
                                    </p>
                                    <p>
                                        Email:{" "}
                                        {selectedReview.userEmail || "--"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    <MessageSquareText className="size-4" />{" "}
                                    Bình luận
                                </span>
                                <p className="rounded-lg border bg-background p-4 text-sm leading-relaxed shadow-sm">
                                    {selectedReview.comment ||
                                        "(Không có bình luận)"}
                                </p>
                            </div>

                            <div className="grid gap-2 text-xs text-muted-foreground">
                                <span>
                                    Ngày tạo:{" "}
                                    {formatDateTime(selectedReview.createdAt)}
                                </span>
                                <span>
                                    Cập nhật lần cuối:{" "}
                                    {formatDateTime(
                                        selectedReview.updatedAt ||
                                            selectedReview.createdAt
                                    )}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() =>
                                        openDeleteDialog(selectedReview)
                                    }
                                >
                                    <Trash2 className="mr-2 size-4" /> Xóa đánh
                                    giá này
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <Dialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDeleteDialog();
                    } else {
                        setDeleteDialogOpen(true);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa đánh giá</DialogTitle>
                        <DialogDescription>
                            Vui lòng nhập lý do xóa. Người dùng sẽ không còn
                            thấy đánh giá này.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="rounded-md bg-muted/40 p-3 text-sm">
                            <p className="font-medium">
                                {reviewToDelete?.userFullName ||
                                    reviewToDelete?.username ||
                                    "Người dùng"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Sản phẩm:{" "}
                                {reviewToDelete?.productName ||
                                    `Sản phẩm #${reviewToDelete?.productId}`}
                            </p>
                        </div>
                        <Textarea
                            rows={4}
                            value={deleteReason}
                            onChange={(event) =>
                                setDeleteReason(event.target.value)
                            }
                            placeholder="Nhập lý do xóa (bắt buộc)"
                            disabled={deleting}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={closeDeleteDialog}
                            disabled={deleting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Xóa đánh giá
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
