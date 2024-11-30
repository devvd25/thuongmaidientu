import React, { useEffect, useState, useMemo } from 'react';
import { adminAPI } from '../../../api/adminApi';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { formatDateAndTime } from '../../../utils/utils';

function ManageOrders() {
    const [searchText, setSearchText] = useState('');
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [productDetails, setProductDetails] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all orders
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.order.getAll(); // Lấy tất cả đơn hàng
            console.log(response);
            setOrders(response.data); // Giả sử response.data chứa danh sách đơn hàng
        } catch (error) {
            console.error("Error fetching orders:", error);
            Swal.fire("Lỗi!", "Không thể tải danh sách đơn hàng. Vui lòng thử lại.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Lọc đơn hàng theo tìm kiếm
    const filteredOrders = useMemo(() => {
        return orders.filter(order =>
            order.id.toString().includes(searchText) ||
            order.orderTime.toString().toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText, orders]);

    const handleViewDetails = async (order) => {
        setSelectedOrder(order);
        try {
            const products = await Promise.all(
                order.items.map(async (item) => {
                    const product = await adminAPI.product.getById(item.productId);
                    return {
                        ...product.data,
                        quantity: item.quantity, // Bao gồm số lượng trong chi tiết sản phẩm
                    };
                })
            );
            setProductDetails(products);
        } catch (error) {
            console.error("Error fetching product details:", error);
            Swal.fire("Lỗi!", "Không thể tải thông tin sản phẩm. Vui lòng thử lại.", "error");
        }
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setProductDetails([]);
    };

    const columns = [
        {
            name: 'Mã Đơn Hàng',
            selector: row => `#${row.id}`,
            sortable: true,
        },
        {
            name: 'Tổng Tiền',
            selector: row => `${row.totalPrice.toLocaleString()} ₫`,
            sortable: true,
        },
        {
            name: 'Ngày Đặt',
            selector: row => formatDateAndTime(row.orderTime), // Định dạng ngày
            sortable: true,
        },
        {
            name: 'Chi Tiết',
            cell: row => (
                <button className="text-blue-500 hover:underline" onClick={() => handleViewDetails(row)}>
                    Xem chi tiết
                </button>
            ),
            ignoreRowClick: true,
        },
    ];

    if (loading) {
        return <div className="text-center">Đang tải dữ liệu...</div>;
    }

    return (
        <>
        <div>
            <Sidebar />
            <div className="p-4 sm:ml-60 overflow-x-auto">
                <div className="p-4 mt-20">
                    <div className="w-full flex justify-between items-center">
                        <div className="font-semibold text-2xl">Quản lý đơn hàng</div>
                        <div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm đơn hàng..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="p-2 border border-gray-500 rounded w-56"
                            />
                        </div>
                    </div>
                    <div className="mt-6">
                        <DataTable
                            columns={columns}
                            data={filteredOrders}
                            pagination
                            highlightOnHover
                            striped
                            customStyles={{
                                headRow: { 
                                    style: { 
                                        fontSize: '15px', 
                                        fontWeight: 'bold', 
                                        backgroundColor: '#2a83e9', 
                                        borderStartStartRadius: '15px', 
                                        borderStartEndRadius: '15px', 
                                        color: "#fff"
                                    } 
                                },
                                rows: { 
                                    style: { 
                                        fontSize: '14px', 
                                        fontWeight: '500', 
                                        fontFamily: 'inter', 
                                        paddingTop: '6px', 
                                        paddingBottom: '6px',
                                        whiteSpace: 'normal',
                                        overflow: 'visible',
                                    } 
                                },
                            }}
                            noDataComponent={<div className="text-center">Không tìm thấy đơn hàng nào.</div>}
                        />
                    </div>
                </div>
            </div>

        </div>
            {/* Modal hiển thị chi tiết đơn hàng */}
            {selectedOrder && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
                        <h3 className="text-lg font-semibold">Chi tiết đơn hàng</h3>
                        <div className="mt-4">
                            <h4 className="font-semibold">Thông tin người nhận:</h4>
                            <p>Họ tên: {selectedOrder.name}</p>
                            <p>Địa chỉ: {selectedOrder.address}</p>
                            <p>Điện thoại: {selectedOrder.phone}</p>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold">Sản phẩm:</h4>
                            {productDetails.map(product => (
                                <div key={product.id} className="grid grid-cols-5 gap-4 items-start border rounded-xl p-2 mt-3">
                                <img className="col-span-1 w-full h-auto object-cover" src={product.images[0]?.url} alt={product.name} />
                                <div className="col-span-3">
                                    <div className="font-semibold text-base line-clamp-1">{product.name}</div>
                                    <div className="font-semibold text-xs mt-1 line-clamp-2">
                                        Mô tả: <span className="text-[#344054] font-light">{product.description}</span>
                                    </div>
                                    <div className="font-semibold text-xs mt-1 line-clamp-2">
                                        Số lượng: <span className="text-[#344054] font-light">{product.quantity}</span>
                                    </div>
                                </div>
                                <div className="col-span-1 text-[#dd2f2c] text-xl font-semibold">{product.discountPrice.toLocaleString()} ₫</div>
                            </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button 
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={handleCloseModal}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ManageOrders;