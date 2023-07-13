/* eslint-disable no-unused-vars */
// POST: /fnb/v1/ssl/order/orderList

// There are 2 types of order tabs (Active/Past)
// Right now whenever there is an active order, API calling will be conducted every 15 secs to refresh the status

// Active
const activeRequest = {
    orderStatus: "active",
    page: 1,
    pageSize: 3,
};

// Past
const pastRequest = {
    orderStatus: "past",
    page: 1,
    pageSize: 3,
};

export const activeResponse = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        code: 200,
        status: "QR000",
        text: "success",
        orderListDetails: {
            pageSize: 3,
            currentPage: 1,
            data: [
                {
                    order_id: "MBBOR111111111221615",
                    merchant_id: "MBUAT1205391",
                    merchant_name: "WWW",
                    customer_id: "160000007000315621",
                    order_no: "181938198Q",
                    created_date: "03:35PM - 9, Nov",
                    net_amt: 4.0,
                    contact_no: "012321321",
                    status: 3,
                    delivery_id: 2,
                    item_no: 4,
                    products: [
                        {
                            product_id: "MKPRD1000734",
                            name: "egg yolks",
                            image_path:
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000734.png",
                            quantity: 4,
                        },
                    ],
                    image: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205391.png",
                    category_name: "Automotive",
                    order_status_text: "Order confirmed for pick up",
                },
            ],
            pageCount: 1,
            success: false,
        },
    },
};

export const pastResponse = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        code: 200,
        status: "QR000",
        text: "success",
        orderListDetails: {
            pageSize: 3,
            currentPage: 1,
            data: [
                {
                    order_id: "MBBOR111111111221583",
                    merchant_id: "MBUAT1205413",
                    merchant_name: "DaneMerchant002",
                    customer_id: "160000007000315621",
                    order_no: "181936824Q",
                    created_date: "12:52PM - 9, Nov",
                    net_amt: 2.0,
                    contact_no: "012321321",
                    status: 1,
                    delivery_id: 4,
                    item_no: 1,
                    products: [
                        {
                            product_id: "MKPRD1000665",
                            name: "Menu 1",
                            image_path:
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000665.jpeg",
                            quantity: 1,
                        },
                    ],
                    image: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205413_Picture_.jpeg",
                    category_name: "Insurance",
                    order_status_text: "Order completed",
                },
                {
                    order_id: "MBBOR111111111221068",
                    merchant_id: "MBUAT1205412",
                    merchant_name: "DaneM001 3rd Party",
                    customer_id: "160000007000315621",
                    order_no: "181024702Q",
                    created_date: "03:11PM - 1, Nov",
                    address: "IOI Mall, Bandar Puchong Jaya Puchong ",
                    state: "Selangor",
                    postcode: "47100",
                    net_amt: 2.97,
                    delivery_amt: 0.0,
                    contact_no: "0123213213",
                    status: 0,
                    delivery_status: 900,
                    delivery_id: 1,
                    item_no: 3,
                    products: [
                        {
                            product_id: "MKPRD1000913",
                            name: "Nasi Lemak Special Buttermilk Spicy Chicken",
                            image_path:
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000913.png",
                            quantity: 3,
                        },
                    ],
                    image: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205412_Picture_.jpeg",
                    trackUpdate: {
                        order_id: "MBBOR111111111221068",
                        order_status: 0,
                        delivery_status: "900",
                        order_status_text: "Cancelled order",
                        delivery_status_text: "Order cancelled",
                        delivery_order_id: "55A9AD64-19A6-4C0C-9B68-DDE3051C7884",
                        consignment_no: "195670503144",
                        invoice_id: "2FD6DF4F-9C86-4997-A725-37651A0F1C34",
                        riderDetails: {},
                        delivery_histories: [
                            {
                                status_code: 900,
                                status_description: "Order cancelled",
                                created_at: "2021-11-01T07:11:54.734Z",
                                coord: {},
                            },
                            {
                                status_code: 900,
                                status_description: "Order cancelled",
                                created_at: "2021-11-01T07:11:54.653Z",
                                coord: {},
                            },
                            {
                                status_code: 100,
                                status_description: "Record created",
                                created_at: "2021-11-01T07:11:22.899Z",
                                coord: {},
                            },
                        ],
                        delivery_map:
                            "https://demo.delyva.app/customer/rmap?trackingNo=195670503144&refer=SSL",
                        is_map: false,
                    },
                    category_name: "Food & Beverages",
                    order_status_text: "Cancelled order",
                    delivery_partner: "Mat Despatch",
                },
                {
                    order_id: "MBBOR111111111220893",
                    merchant_id: "MBUAT1205412",
                    merchant_name: "DaneM001 3rd Party",
                    customer_id: "160000007000315621",
                    order_no: "181021390Q",
                    created_date: "03:18PM - 29, Oct",
                    address: "IOI Mall, Bandar Puchong Jaya Puchong ",
                    state: "Selangor",
                    postcode: "47100",
                    net_amt: 2.97,
                    delivery_amt: 0.0,
                    contact_no: "0123213213",
                    status: 0,
                    delivery_status: 900,
                    delivery_id: 1,
                    item_no: 3,
                    products: [
                        {
                            product_id: "MKPRD1000913",
                            name: "Nasi Lemak Special Buttermilk Spicy Chicken",
                            image_path:
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000913.png",
                            quantity: 3,
                        },
                    ],
                    image: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205412_Picture_.jpeg",
                    trackUpdate: {
                        order_id: "MBBOR111111111220893",
                        order_status: 0,
                        delivery_status: "900",
                        order_status_text: "Cancelled order",
                        delivery_status_text: "Order cancelled",
                        delivery_order_id: "F90DD55A-97BF-49F2-A9B7-688747F5F464",
                        consignment_no: "196670501173",
                        invoice_id: "241FD3B4-CB63-4449-991A-7E8CE75CE53F",
                        riderDetails: {},
                        delivery_histories: [
                            {
                                status_code: 900,
                                status_description: "Order cancelled",
                                created_at: "2021-10-29T07:19:02.747Z",
                                coord: {},
                            },
                            {
                                status_code: 900,
                                status_description: "Order cancelled",
                                created_at: "2021-10-29T07:19:02.668Z",
                                coord: {},
                            },
                            {
                                status_code: 100,
                                status_description: "Record created",
                                created_at: "2021-10-29T07:18:50.569Z",
                                coord: {},
                            },
                        ],
                        delivery_map:
                            "https://demo.delyva.app/customer/rmap?trackingNo=196670501173&refer=SSL",
                        is_map: false,
                    },
                    category_name: "Food & Beverages",
                    order_status_text: "Cancelled order",
                    delivery_partner: "Mat Despatch",
                },
            ],
            pageCount: 10,
            success: false,
        },
    },
};
