// Dashboard API debugging utility
import { dashboardAPI, dataAPI } from './axios';

export const debugDashboardAPIs = async () => {
  console.log('🔍 Starting comprehensive dashboard API debugging...');
  
  const results = {};
  
  try {
    console.log('🔍 Testing dashboard stats...');
    const statsResponse = await dashboardAPI.getStats();
    console.log('✅ Stats Response:', statsResponse);
    console.log('✅ Stats Data:', statsResponse.data);
    results.stats = { success: true, data: statsResponse.data };
  } catch (error) {
    console.error('❌ Stats Error:', error);
    results.stats = { success: false, error: error.message, details: error.response?.data };
  }
  
  try {
    console.log('🔍 Testing entity distribution...');
    const distributionResponse = await dashboardAPI.getEntityDistribution();
    console.log('✅ Distribution Response:', distributionResponse);
    console.log('✅ Distribution Data:', distributionResponse.data);
    results.distribution = { success: true, data: distributionResponse.data };
  } catch (error) {
    console.error('❌ Distribution Error:', error);
    results.distribution = { success: false, error: error.message, details: error.response?.data };
  }
  
  try {
    console.log('🔍 Testing orders...');
    const ordersResponse = await dataAPI.getOrders();
    console.log('✅ Orders Response:', ordersResponse);
    console.log('✅ Orders Data:', ordersResponse.data);
    console.log('✅ Orders Count:', Array.isArray(ordersResponse.data) ? ordersResponse.data.length : 'Not an array');
    results.orders = { success: true, data: ordersResponse.data };
  } catch (error) {
    console.error('❌ Orders Error:', error);
    results.orders = { success: false, error: error.message, details: error.response?.data };
  }
  
  try {
    console.log('🔍 Testing revenue summary...');
    const revenueResponse = await dashboardAPI.getRevenueSummary();
    console.log('✅ Revenue Response:', revenueResponse);
    console.log('✅ Revenue Data:', revenueResponse.data);
    results.revenue = { success: true, data: revenueResponse.data };
  } catch (error) {
    console.error('❌ Revenue Error:', error);
    results.revenue = { success: false, error: error.message, details: error.response?.data };
  }
  
  try {
    console.log('🔍 Testing customers...');
    const customersResponse = await dataAPI.getCustomers();
    console.log('✅ Customers Response:', customersResponse);
    console.log('✅ Customers Data:', customersResponse.data);
    console.log('✅ Customers Count:', Array.isArray(customersResponse.data) ? customersResponse.data.length : 'Not an array');
    results.customers = { success: true, data: customersResponse.data };
  } catch (error) {
    console.error('❌ Customers Error:', error);
    results.customers = { success: false, error: error.message, details: error.response?.data };
  }
  
  try {
    console.log('🔍 Testing products...');
    const productsResponse = await dataAPI.getProducts();
    console.log('✅ Products Response:', productsResponse);
    console.log('✅ Products Data:', productsResponse.data);
    console.log('✅ Products Count:', Array.isArray(productsResponse.data) ? productsResponse.data.length : 'Not an array');
    results.products = { success: true, data: productsResponse.data };
  } catch (error) {
    console.error('❌ Products Error:', error);
    results.products = { success: false, error: error.message, details: error.response?.data };
  }
  
  console.log('🏁 Dashboard API debugging complete:', results);
  return results;
};

export const checkBackendConnection = async () => {
  console.log('🔍 Checking backend connection...');
  
  try {
    // Try a simple health check or any endpoint that should work
    const response = await fetch('http://localhost:8081/api/dashboard/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔍 Backend response status:', response.status);
    console.log('🔍 Backend response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is responding with data:', data);
      return { connected: true, data };
    } else {
      const errorText = await response.text();
      console.error('❌ Backend responded with error:', response.status, errorText);
      return { connected: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return { connected: false, error: error.message };
  }
};
