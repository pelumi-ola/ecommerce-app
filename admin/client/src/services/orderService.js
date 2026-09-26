import api from "../api";

export const getOrders = async () => {
  const response = await api.get("/api/admin/orders");

  return response.data?.data || [];
};

export const verifyOrder = async (id, paymentDetails) => {
  const response = await api.patch(
    `/api/admin/orders/${id}/verify`,
    paymentDetails,
  );

  return response.data?.data;
};

export const confirmPayment = async (id) => {
  const response = await api.patch(`/api/admin/orders/${id}/confirm-payment`);

  return response.data?.data;
};

export const updateOrderStatus = async (id, payload) => {
  const response = await api.patch(`/api/admin/orders/${id}/status`, payload);

  return response.data?.data;
};
