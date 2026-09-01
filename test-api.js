// Simple API test script
// Run with: node test-api.js

const testEndpoints = async () => {
  const BASE_URL = 'https://redaccion.morroinformativo.com/wp-json/bahia/v1';

  console.log('🧪 Testing Bellota API endpoints...\n');

  // Test 1: Get galleries list
  console.log('1️⃣  Testing GET /galerias (list)');
  try {
    const res = await fetch(`${BASE_URL}/galerias?page=1&per_page=3`);
    if (!res.ok) {
      console.log(`   ❌ Status: ${res.status}`);
      return;
    }
    const data = await res.json();
    console.log(`   ✅ Success! Found ${data.data?.length || 0} galleries`);
    if (data.data?.length > 0) {
      console.log(`   📷 First gallery: "${data.data[0].title}"`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // Test 2: Get gallery by slug
  console.log('\n2️⃣  Testing GET /galerias/{slug} (detail)');
  try {
    // You need to replace this with an actual gallery slug from your WordPress
    const res = await fetch(`${BASE_URL}/galerias/test-gallery`);
    if (res.status === 404) {
      console.log(`   ℹ️  404 - No gallery found with slug "test-gallery"`);
      console.log(`   💡 This is normal if you don't have a gallery with this slug yet`);
    } else if (!res.ok) {
      console.log(`   ❌ Status: ${res.status}`);
    } else {
      const data = await res.json();
      if (data.success) {
        console.log(`   ✅ Success! Gallery: "${data.data.title}"`);
        console.log(`   📸 Photos: ${data.data.photos?.length || 0}`);
      }
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // Test 3: Get posts (existing endpoint)
  console.log('\n3️⃣  Testing GET /posts (existing endpoint)');
  try {
    const res = await fetch(`${BASE_URL}/posts?page=1&per_page=3`);
    if (!res.ok) {
      console.log(`   ❌ Status: ${res.status}`);
      return;
    }
    const data = await res.json();
    console.log(`   ✅ Success! Found ${data?.length || 0} posts`);
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // Test 4: Check CORS headers
  console.log('\n4️⃣  Testing CORS headers');
  try {
    const res = await fetch(`${BASE_URL}/galerias?page=1&per_page=1`, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    const acaoHeader = res.headers.get('access-control-allow-origin');
    if (acaoHeader) {
      console.log(`   ✅ CORS enabled: ${acaoHeader}`);
    } else {
      console.log(`   ℹ️  No CORS header (might be in OPTIONS request)`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  console.log('\n📝 Note: If galleries are empty, create some galleries in WordPress admin first.');
  console.log('📝 Make sure the gallery slugs use lowercase and hyphens (e.g., "fiesta-patronal-2026")\n');
};

testEndpoints();
