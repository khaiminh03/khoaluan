// services/orderService.ts
import axios from 'axios';

export const createOrder = async (data: any) => {
  const res = await axios.post('http://localhost:5000/orders', data);
  return res.data;
};
