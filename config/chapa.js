import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CHAPA_URL = process.env.CHAPA_URL || "https://api.chapa.co/v1";
const CHAPA_AUTH = process.env.CHAPA_SECRET_KEY;

// Initialize Chapa API client
const chapaClient = axios.create({
  baseURL: CHAPA_URL,
  headers: {
    'Authorization': `Bearer ${CHAPA_AUTH}`,
    'Content-Type': 'application/json'
  }
});

// Generate unique transaction reference
export const generateTransactionRef = () => {
  const prefix = 'LMS-TX-';
  const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
  return `${prefix}${uniqueId}`;
};

// Initialize payment
export const initializePayment = async ({
  amount,
  currency,
  email,
  first_name,
  last_name,
  tx_ref,
  callback_url,
  return_url,
  customization
}) => {
  try {
    console.log('Initializing Chapa payment with:', {
      amount,
      currency,
      email,
      tx_ref,
      callback_url,
      return_url
    });

    const response = await chapaClient.post('/transaction/initialize', {
      amount,
      currency,
      email,
      first_name,
      last_name,
      tx_ref,
      callback_url,
      return_url,
      customization
    });
    
    console.log('Chapa payment initialized:', response.data);
    return response.data;
  } catch (error) {
    console.error('Chapa payment initialization error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

// Verify transaction
export const verifyTransaction = async (txRef) => {
  try {
    console.log('Verifying Chapa transaction:', txRef);
    const response = await chapaClient.get(`/transaction/verify/${txRef}`);
    console.log('Chapa verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Chapa verification error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

export default {
  initializePayment,
  verifyTransaction,
  generateTransactionRef
};
