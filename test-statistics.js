const fs = require('fs');

// Script para probar todos los endpoints de estadísticas
const BASE_URL = 'http://localhost:3001/api/stats';

// Lista de endpoints a probar
const endpoints = [
  { name: 'Dashboard Stats', url: '/dashboard' },
  { name: 'Income Stats', url: '/income?period=month' },
  { name: 'Services Stats', url: '/services' },
  { name: 'Technician Rankings', url: '/technicians/rankings' },
  { name: 'Technician Efficiency', url: '/technicians/efficiency' },
  { name: 'Equipment Services', url: '/equipment/services' },
  { name: 'Client Rankings', url: '/clients/rankings' },
  { name: 'Recent Transactions', url: '/transactions/recent?limit=5' }
];

// Token de administrador (necesita ser actualizado)
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Actualizar con token real

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🧪 Probando: ${endpoint.name}`);
    console.log(`📡 URL: GET ${BASE_URL}${endpoint.url}`);
    
    const response = await fetch(`${BASE_URL}${endpoint.url}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${endpoint.name}: OK`);
      console.log(`📊 Datos:`, JSON.stringify(data.data, null, 2));
    } else {
      console.log(`❌ ${endpoint.name}: ERROR`);
      console.log(`🚨 Error:`, data.message || data.error);
    }
    
    return { name: endpoint.name, success: response.ok, data: data.data };
  } catch (error) {
    console.log(`❌ ${endpoint.name}: EXCEPCIÓN`);
    console.log(`🚨 Error:`, error.message);
    return { name: endpoint.name, success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 INICIANDO PRUEBAS DE ESTADÍSTICAS...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📋 RESUMEN DE PRUEBAS:');
  console.log('========================');
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n📊 Resultado: ${successful}/${total} endpoints funcionando`);
  
  // Guardar resultados en archivo
  const report = {
    timestamp: new Date().toISOString(),
    summary: { successful, total, percentage: (successful/total*100).toFixed(1) },
    results: results
  };
  
  fs.writeFileSync('statistics-test-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Reporte guardado en: statistics-test-report.json');
}

// Verificar si Node.js tiene fetch (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ Este script requiere Node.js 18+ con fetch nativo');
  console.log('💡 Alternativa: usar curl o Postman para probar los endpoints');
  
  console.log('\n📋 ENDPOINTS A PROBAR:');
  endpoints.forEach(endpoint => {
    console.log(`curl -H "Authorization: Bearer YOUR_TOKEN" "${BASE_URL}${endpoint.url}"`);
  });
} else {
  // Ejecutar pruebas solo si se proporciona un token
  if (ADMIN_TOKEN.includes('...')) {
    console.log('⚠️  ACTUALIZAR TOKEN EN LA LÍNEA 18 DEL SCRIPT');
    console.log('💡 Obtener token haciendo login como admin');
  } else {
    runAllTests();
  }
}