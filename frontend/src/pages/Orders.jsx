import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getOrdersByUserId } from '../api/orderAPI';
import { toast } from 'sonner';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Clock, CreditCard, Truck, CheckCircle, XCircle, Package } from 'lucide-react';

const orderStatusLabels = {
    PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800', Icon: Clock },
    PAID: { label: 'Đã thanh toán', color: 'bg-blue-100 text-blue-800', Icon: CreditCard },
    SHIPPED: { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800', Icon: Truck },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', Icon: CheckCircle },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', Icon: XCircle }
};

const paymentMethodLabels = {
    CASH: 'Tiền mặt khi nhận hàng (COD)',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
    CREDIT_CARD: 'Thẻ tín dụng',
    DEBIT_CARD: 'Thẻ ghi nợ',
    MOMO: 'Ví MoMo',
    ZALOPAY: 'ZaloPay',
    VNPAY: 'VNPay',
    SHOPEEPAY: 'ShopeePay'
};

export default function Orders() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    const { orderId, message } = location.state || {};

    useEffect(() => {
        loadOrders();

        // Show success message if coming from checkout
        if (message) {
            toast.success(message);
        }
    }, [message]);

    const loadOrders = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                toast.error('Vui lòng đăng nhập');
                navigate('/login');
                return;
            }

            const user = JSON.parse(userStr);
            
            const orderList = await getOrdersByUserId(user.id);

            if (Array.isArray(orderList)) {
                setOrders(orderList);
            } else if (orderList) {
                // Nếu trả về 1 order thay vì array
                setOrders([orderList]);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            const errorMsg = error.response?.data || error.message || 'Có lỗi xảy ra khi tải đơn hàng';
            toast.error(errorMsg);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <Navbar currentPage="Đơn hàng của tôi" />

            <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-4">Đơn hàng của tôi</h1>
                    
                    {/* Filter tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setFilterStatus('ALL')}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                                filterStatus === 'ALL'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Tất cả ({orders.length})
                        </button>
                        {Object.entries(orderStatusLabels).map(([status, info]) => {
                            const count = orders.filter(o => o.status === status).length;
                            const IconComponent = info.Icon;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                                        filterStatus === status
                                            ? 'bg-red-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <IconComponent size={16} />
                                    <span>{info.label} ({count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
                        <p className="mt-2 text-gray-600">Đang tải đơn hàng...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg shadow text-center">
                        <Package size={80} className="mx-auto mb-4 text-gray-300" />
                        <h2 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h2>
                        <p className="text-gray-500 mb-6">Hãy khám phá và mua sắm những sản phẩm yêu thích của bạn</p>
                        <button
                            onClick={() => navigate('/home')}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Khám phá ngay
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders
                            .filter(order => filterStatus === 'ALL' || order.status === filterStatus)
                            .map((order) => {
                            const statusInfo = orderStatusLabels[order.status] || orderStatusLabels.PENDING;
                            
                            return (
                                <div
                                    key={order.id}
                                    className={`bg-white p-6 rounded-lg shadow ${
                                        orderId === order.id ? 'ring-2 ring-red-500' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-lg font-semibold">
                                                Đơn hàng #{order.id}
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                                            </p>
                                            {order.fullName && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Người nhận: {order.fullName} - {order.phone}
                                                </p>
                                            )}
                                            {order.address && (
                                                <p className="text-sm text-gray-600">
                                                    Địa chỉ: {order.address}, {order.ward && `${order.ward}, `}{order.district && `${order.district}, `}{order.city}
                                                </p>
                                            )}
                                            {order.paymentMethod && (
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <CreditCard size={14} />
                                                    {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span
                                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                                            >
                                                <statusInfo.Icon size={14} />
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold mb-3 text-sm">Sản phẩm:</h3>
                                        <div className="space-y-3">
                                            {order.orderItems?.map((item, index) => (
                                                <div key={index} className="flex items-center space-x-4">
                                                    <img
                                                        src={item.product?.imageUrl || 'https://via.placeholder.com/60'}
                                                        alt={item.product?.name || 'Sản phẩm'}
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-medium">
                                                            {item.product?.name || 'Sản phẩm'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            Số lượng: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-red-600">
                                                            {(item.price * item.quantity).toLocaleString()}đ
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                            <span className="font-semibold">Tổng cộng:</span>
                                            <span className="text-xl font-bold text-red-600">
                                                {order.orderItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}đ
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
