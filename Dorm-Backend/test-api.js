/**
 * Quick API Test Script
 * This script tests the basic functionality of the Dorm Management System API
 * 
 * Usage: node test-api.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';
let testTenantId = '';
let testPaymentId = '';

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (authToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  const data = await response.json();
  return { status: response.status, data };
}

// Test functions
async function testServerHealth() {
  console.log('\n🔍 Testing Server Health...');
  try {
    const response = await fetch('http://localhost:5000');
    const data = await response.json();
    console.log('✅ Server is running');
    console.log('   Response:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Server is not running');
    console.log('   Error:', error.message);
    return false;
  }
}

async function testRegister() {
  console.log('\n🔍 Testing User Registration...');
  try {
    const { status, data } = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        fullName: 'Test User',
        phone: '09123456789',
        role: 'staff'
      })
    });
    
    if (status === 201 && data.token) {
      console.log('✅ Registration successful');
      authToken = data.token;
      testUserId = data.user.id;
      console.log('   User ID:', testUserId);
      console.log('   Username:', data.user.username);
      console.log('   Token received');
      return true;
    } else {
      console.log('❌ Registration failed');
      console.log('   Status:', status);
      console.log('   Response:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Registration error');
    console.log('   Error:', error.message);
    return false;
  }
}

async function testGetCurrentUser() {
  console.log('\n🔍 Testing Get Current User...');
  try {
    const { status, data } = await apiRequest('/auth/me');
    
    if (status === 200 && data.id) {
      console.log('✅ Get current user successful');
      console.log('   User:', data.fullName);
      console.log('   Role:', data.role);
      return true;
    } else {
      console.log('❌ Get current user failed');
      console.log('   Status:', status);
      return false;
    }
  } catch (error) {
    console.log('❌ Get current user error');
    console.log('   Error:', error.message);
    return false;
  }
}

async function testGetTenants() {
  console.log('\n🔍 Testing Get All Tenants...');
  try {
    const { status, data } = await apiRequest('/tenants');
    
    if (status === 200) {
      console.log('✅ Get tenants successful');
      console.log('   Total tenants:', data.length);
      if (data.length > 0) {
        testTenantId = data[0].id;
        console.log('   First tenant:', data[0].fullName);
      }
      return true;
    } else {
      console.log('❌ Get tenants failed');
      console.log('   Status:', status);
      return false;
    }
  } catch (error) {
    console.log('❌ Get tenants error');
    console.log('   Error:', error.message);
    return false;
  }
}

async function testCreatePayment() {
  console.log('\n🔍 Testing Create Payment...');
  
  if (!testTenantId) {
    console.log('⚠️  Skipping: No tenant ID available');
    return false;
  }
  
  try {
    const { status, data } = await apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify({
        tenantId: testTenantId,
        amount: 10000.00,
        paymentType: 'Rent Bill',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Unpaid',
        notes: 'Test payment'
      })
    });
    
    if (status === 201 && data.id) {
      console.log('✅ Create payment successful');
      testPaymentId = data.id;
      console.log('   Payment ID:', testPaymentId);
      console.log('   Amount:', data.amount);
      return true;
    } else {
      console.log('❌ Create payment failed');
      console.log('   Status:', status);
      console.log('   Response:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Create payment error');
    console.log('   Error:', error.message);
    return false;
  }
}

async function testGetPaymentStatistics() {
  console.log('\n🔍 Testing Get Payment Statistics...');
  try {
    const { status, data } = await apiRequest('/payments/statistics');
    
    if (status === 200) {
      console.log('✅ Get payment statistics successful');
      console.log('   Total Collected:', data.totalCollected);
      console.log('   Due Today:', data.dueToday);
      console.log('   Overdue:', data.overdue);
      return true;
    } else {
      console.log('❌ Get payment statistics failed');
      console.log('   Status:', status);
      return false;
    }
  } catch (error) {
    console.log('❌ Get payment statistics error');
    console.log('   Error:', error.message);
    return false;
  }
}

async function testUpdatePayment() {
  console.log('\n🔍 Testing Update Payment...');
  
  if (!testPaymentId) {
    console.log('⚠️  Skipping: No payment ID available');
    return false;
  }
  
  try {
    const { status, data } = await apiRequest(`/payments/${testPaymentId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'Paid',
        paidAmount: 10000.00,
        paymentMethod: 'Cash'
      })
    });
    
    if (status === 200) {
      console.log('✅ Update payment successful');
      console.log('   New status:', data.status);
      console.log('   Paid amount:', data.paidAmount);
      return true;
    } else {
      console.log('❌ Update payment failed');
      console.log('   Status:', status);
      return false;
    }
  } catch (error) {
    console.log('❌ Update payment error');
    console.log('   Error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 Dorm Management System API Tests');
  console.log('='.repeat(60));
  
  const serverHealthy = await testServerHealth();
  
  if (!serverHealthy) {
    console.log('\n❌ Server is not running. Please start the server first:');
    console.log('   cd Dorm-Backend && npm run dev');
    process.exit(1);
  }
  
  const results = [];
  
  results.push(await testRegister());
  results.push(await testGetCurrentUser());
  results.push(await testGetTenants());
  results.push(await testCreatePayment());
  results.push(await testGetPaymentStatistics());
  results.push(await testUpdatePayment());
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
  
  console.log('\n💡 Tips:');
  console.log('   - Make sure the database is running and configured');
  console.log('   - Check that all tables are created (run server once first)');
  console.log('   - Review server logs for any errors');
  console.log('');
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

