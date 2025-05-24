# 🧪 GUÍA DE FLUJO DE PRUEBAS - FRIOSERVICE API

## 📋 Pre-requisitos

1. **Servidor ejecutándose**: `npm run dev` en puerto 3001
2. **Base de datos configurada**: Prisma migrations aplicadas
3. **Insomnia/Postman instalado**

## 🚀 FASE 1: Configuración Inicial

### 1. Importar Colecciones
- `clients-complete-insomnia.json`
- `equipment-insomnia-collection.json` 
- `quotes-insomnia-collection.json`
- `services-insomnia-collection.json` (existente)

### 2. Configurar Variables de Entorno
```json
{
  "base_url": "http://localhost:3001",
  "admin_token": "",
  "client_token": "",
  "technician_token": "",
  "user_admin_id": "",
  "user_client_id": "",
  "user_technician_id": "",
  "client_id": "",
  "service_id": "",
  "equipment_id": "",
  "quote_id": ""
}
```

## 🔐 FASE 2: Autenticación y Registro

### 1. Registrar Usuarios (Auth Collection)
```
POST /api/auth/register
```

**Admin User:**
```json
{
  "username": "admin",
  "email": "admin@frioservice.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

**Client User:**
```json
{
  "username": "cliente1",
  "email": "cliente1@test.com", 
  "password": "cliente123",
  "role": "CLIENT"
}
```

**Technician User:**
```json
{
  "username": "tecnico1",
  "email": "tecnico1@test.com",
  "password": "tecnico123",
  "role": "TECHNICIAN"
}
```

### 2. Obtener Tokens (Auth Collection)
```
POST /api/auth/login
```

Para cada usuario, guardar el token en las variables de entorno.

## 👥 FASE 3: Gestión de Clientes

### Orden de Pruebas:
1. **Crear Cliente** (Admin token)
2. **Obtener Todos los Clientes** (Admin token)
3. **Buscar Clientes** (Admin token)
4. **Obtener Cliente por ID** (Admin/Client token)
5. **Obtener Cliente por User ID** (Client token)
6. **Actualizar Cliente** (Admin token)
7. **Actualizar Estado** (Admin token)
8. **Toggle VIP Status** (Admin token)
9. **Obtener Estadísticas** (Admin token)
10. **Clientes por Tipo** (Admin token)
11. **Clientes VIP** (Admin token)

### ✅ Casos de Éxito Esperados:
- Status 201 para creación
- Status 200 para consultas exitosas
- Datos completos en respuestas
- Paginación funcionando

### ❌ Casos de Error a Probar:
- Token inválido (401)
- Permisos insuficientes (403)
- Cliente no encontrado (404)
- Datos inválidos (400)

## 🔧 FASE 4: Gestión de Equipos

### Orden de Pruebas:
1. **Crear Equipo** (Admin/Client token)
2. **Obtener Todos los Equipos** (Admin/Technician token)
3. **Obtener Equipo por ID** (Cualquier token)
4. **Obtener Equipos por Cliente** (Admin/Client token)
5. **Actualizar Equipo** (Admin/Client token)
6. **Actualizar Estado del Equipo** (Admin/Technician token)
7. **Eliminar Equipo** (Admin token)

### ✅ Validaciones Importantes:
- Cliente debe existir para crear equipo
- Fechas de instalación y garantía válidas
- Estados permitidos: ACTIVE, INACTIVE, MAINTENANCE, BROKEN

## 💰 FASE 5: Gestión de Cotizaciones

### Orden de Pruebas:
1. **Crear Cotización** (Admin/Technician token)
2. **Obtener Todas las Cotizaciones** (Admin/Technician token)
3. **Obtener Cotización por ID** (Cualquier token)
4. **Obtener Cotizaciones por Cliente** (Admin/Client token)
5. **Actualizar Cotización** (Admin/Technician token)
6. **Aprobar Cotización** (Admin/Client token)
7. **Rechazar Cotización** (Admin/Client token)
8. **Cotizaciones Expiradas** (Admin token)
9. **Eliminar Cotización** (Admin token)

### ✅ Validaciones Importantes:
- Montos deben ser positivos
- Fechas de validez futuras
- Cliente debe existir
- Servicio debe existir (si se proporciona)

## 🔄 FASE 6: Servicios (Existente)

Usar la colección existente de servicios para probar la integración completa.

## 🧪 FASE 7: Pruebas de Integración

### Flujo Completo:
1. **Crear Cliente** → Guardar client_id
2. **Crear Equipo** para el cliente → Guardar equipment_id
3. **Crear Servicio** para el cliente → Guardar service_id
4. **Crear Cotización** para el servicio → Guardar quote_id
5. **Aprobar Cotización**
6. **Asignar Técnico al Servicio**
7. **Completar Servicio**

### Validaciones de Integridad:
- Relaciones entre entidades
- Permisos por rol
- Estados consistentes
- Datos sincronizados

## 📊 FASE 8: Pruebas de Rendimiento

### Pruebas de Carga:
- Múltiples solicitudes simultáneas
- Paginación con grandes datasets
- Búsquedas complejas con filtros

### Métricas a Monitorear:
- Tiempo de respuesta < 500ms
- Rate limiting funcionando
- Memoria del servidor estable

## 🚨 FASE 9: Pruebas de Seguridad

### Validaciones de Seguridad:
1. **Tokens expirados** → 401
2. **Tokens inválidos** → 401
3. **Acceso sin permisos** → 403
4. **Inyección SQL** → Datos sanitizados
5. **XSS** → Headers de seguridad
6. **CORS** → Orígenes permitidos

## 📝 FASE 10: Documentación de Resultados

### Crear Reporte de Pruebas:
- ✅ Endpoints funcionando correctamente
- ❌ Endpoints con problemas
- 🔧 Mejoras recomendadas
- 📊 Métricas de rendimiento

---

## 🎯 Criterios de Aceptación

### Para considerar FASE 4 completada:
- [ ] Todos los endpoints responden correctamente
- [ ] Validaciones funcionando
- [ ] Permisos por rol implementados
- [ ] Errores manejados apropiadamente
- [ ] Paginación funcionando
- [ ] Filtros aplicándose correctamente
- [ ] Relaciones entre entidades válidas
- [ ] Rendimiento aceptable (< 500ms)
- [ ] Seguridad validada

### Siguiente Fase:
**FASE 5: Documentación con Swagger/OpenAPI**