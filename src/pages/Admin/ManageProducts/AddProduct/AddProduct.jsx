import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { adminAPI } from '../../../../api/adminApi';
import ImageUploader from '../../../../components/ImageUploader/ImageUploader';

const AddProduct = ({ isOpen, onClose, fetchData, categories }) => {
    const [productData, setProductData] = useState({
        categoryId: '',
        name: '',
        model: '',
        costPrice: '',
        salePrice: '',
        discountPrice: '',
        description: '',
        images: [],
        specification: {},
        type: '',
        features: '',
        promotions: '',
        stock: '',
    });

    const categorySpecifications = {
        // Định nghĩa cấu hình cho các loại sản phẩm
        '1': { cpu: '', ram: '', storage: '', screen: '', graphics: '', ports: [], weight: '', os: '' },
        '2': { chip: '', ram: '', storage: '', camera: '', battery: '', connectivity: [] },
        '3': { screen: '', chip: '', storage: '', battery: '', connectivity: '' },
        '4': { sensor: '', processor: '', autofocus: '', screen: '', video: '' },
        '5': { chip: '', screen: '', ram: '', storage: '', camera: '', battery: '' },
        '6': { size: '', panel: '', resolution: '', refreshRate: '', responseTime: '', ports: [] }
    };

    const specificationLabels = {
        cpu: 'Bộ vi xử lý (CPU)',
        ram: 'RAM',
        storage: 'Bộ nhớ',
        screen: 'Màn hình',
        graphics: 'Đồ họa',
        ports: 'Cổng kết nối',
        weight: 'Trọng lượng',
        os: 'Hệ điều hành',
        chip: 'Chip',
        camera: 'Camera',
        battery: 'Pin',
        connectivity: 'Kết nối',
        sensor: 'Cảm biến',
        processor: 'Bộ xử lý',
        autofocus: 'Lấy nét tự động',
        video: 'Video',
        size: 'Kích thước',
        panel: 'Màn hình',
        resolution: 'Độ phân giải',
        refreshRate: 'Tần số làm tươi',
        responseTime: 'Thời gian phản hồi'
    };

    useEffect(() => {
        if (productData.categoryId) {
            setProductData(prevData => ({
                ...prevData,
                specification: categorySpecifications[productData.categoryId]
            }));
        } else {
            setProductData(prevData => ({
                ...prevData,
                specification: {}
            }));
        }
    }, [productData.categoryId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleImagesChange = (newImages) => {
        setProductData(prevData => ({
            ...prevData,
            images: newImages // Cập nhật danh sách ảnh đã chọn
        }));
    };

    const handleSpecificationChange = (e) => {
        const { name, value } = e.target;
        setProductData(prevData => ({
            ...prevData,
            specification: {
                ...prevData.specification,
                [name]: value
            }
        }));
    };



    const validateFields = () => {
        const { categoryId, name, model, costPrice, salePrice, discountPrice, description, images, specification } = productData;

        // Kiểm tra các trường chính
        if (!categoryId || !name || !model || !costPrice || !salePrice || !discountPrice || !description || images.length === 0) {
            Swal.fire('Lỗi!', 'Vui lòng điền đầy đủ thông tin sản phẩm.', 'error');
            return false;
        }

        // Kiểm tra các trường trong specification
        for (const specKey in specification) {
            if (specification[specKey] === '') {
                Swal.fire('Lỗi!', `Vui lòng điền đầy đủ thông tin cho ${specificationLabels[specKey]}.`, 'error');
                return false;
            }
        }

        return true;
    };

    const handleAddProduct = async () => {
        if (!validateFields()) return;
    
        const productPayload = {
            ...productData,
            images: productData.images.map(image => image.url) // Chỉ cần URL của hình ảnh
        };
    
        try {
            // Gửi yêu cầu đến API
            const response = await adminAPI.product.createProduct(productData);
            if (response.status === 201) {
                Swal.fire('Thành công!', 'Thêm sản phẩm thành công.', 'success');
                fetchData();
                onClose();
                setProductData({
                    categoryId: '',
                    name: '',
                    model: '',
                    costPrice: '',
                    salePrice: '',
                    discountPrice: '',
                    description: '',
                    images: [],
                    specification: {},
                    type: '',
                    features: '',
                    promotions: '',
                    stock: '',
                });

            }
        } catch (error) {
            console.error("Error adding product:", error);
            Swal.fire('Lỗi!', 'Có lỗi xảy ra khi thêm sản phẩm.', 'error');
        }
    };

    return (
        <div>
            <div className={`fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 ${isOpen ? '' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative overflow-y-auto max-h-[90%]">
                    <h2 className="text-lg font-semibold mb-4">Thêm sản phẩm</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-1">Thể loại</label>
                            <select name="categoryId" value={productData.categoryId} onChange={handleChange} className="p-2 border border-gray-500 rounded w-full">
                                <option value="">Chọn thể loại</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1">Tên sản phẩm</label>
                            <input type="text" name="name" value={productData.name} onChange={handleChange} className="p-2 border border-gray-500 rounded w-full" />
                        </div>
                        <div>
                            <label className="block mb-1">Hãng</label>
                            <input type="text" name="model" value={productData.model} onChange={handleChange} className="p-2 border border-gray-500 rounded w-full" />
                        </div>
                        <div>
                            <label className="block mb-1">Giá Gốc</label>
                            <input type="number" name="costPrice" value={productData.costPrice} onChange={handleChange} className="p-2 border border-gray-500 rounded w-full" />
                        </div>
                        <div>
                            <label className="block mb-1">Giá Bán</label>
                            <input type="number" name="salePrice" value={productData.salePrice} onChange={handleChange} className="p-2 border border-gray-500 rounded w-full" />
                        </div>
                        <div>
                            <label className="block mb-1">Giá Khuyến Mãi</label>
                            <input type="number" name="discountPrice" value={productData.discountPrice} onChange={handleChange} className="p-2 border border-gray-500 rounded w-full" />
                        </div>
                        <div className="col-span-2 ">
                            <label className="block mb-1">Mô Tả</label>
                            <textarea name="description" value={productData.description} onChange={handleChange} className="p-2 border border-gray-500 rounded w-full" rows="3" />
                        </div>
                        <div>
                            <label className="block mb-1">Loại sản phẩm</label>
                            <input type="text" name="type" value={productData.type} onChange={handleChange} className="p-2 border border-gray-500 rounded w-full" />
                        </div>
                        
                        <div>
                            <label className="block mb-1">Số lượng</label>
                            <input type="number" min={1} name="stock" value={productData.stock} onChange={handleChange} className="p-2 border border-gray-500 rounded w-full" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.keys(productData.specification).map(specKey => (
                            <div className='col-span-1' key={specKey}>
                                <label className="block mb-1">{specificationLabels[specKey]}</label>
                                <input
                                    type="text"
                                    name={specKey}
                                    value={productData.specification[specKey] || ''}
                                    onChange={handleSpecificationChange}
                                    className="p-2 border border-gray-500 rounded w-full"
                                    placeholder={`Nhập ${specificationLabels[specKey]}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="col-span-2 my-4">
                    <ImageUploader onImagesChange={handleImagesChange} categoryId={productData.categoryId} />
                    </div>
                    {/* Preview Images Section */}
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Hình ảnh đã chọn:</h3>
                        <div className="grid grid-cols-6 gap-6">
                            {productData.images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img src={image.url} alt={image.alt} className="w-full h-32 object-cover rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                        <button onClick={handleAddProduct} className="px-4 py-2 bg-blue-500 text-white rounded">Thêm sản phẩm</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;