# FrioService - API de Clientes

## Información General

La API de Clientes permite gestionar todos los aspectos relacionados con los perfiles de clientes, incluyendo creación, actualización, búsqueda, gestión de estado VIP y estadísticas.

**Base URL:** `http://localhost:3001/api/clients`

**Autenticación:** Todas las rutas requieren token JWT válido en el header `Authorization: Bearer <token>`

---

## Endpoints Disponibles

### 1. Crear Cliente
**POST** `/api/clients`

Crea un nuevo perfil de cliente en el sistema.

#### Permisos Requeridos
- `ADMIN`

#### Body (JSON)
```json
{
  "userId": "string (requerido)",
  "companyName": "string (opcional para empresas, max 200 chars)",
  "contactPerson": "string (opcional para personas, max 100 chars)",
  "businessRegistration": "string (opcional, 8-20 chars) - RUC/DNI",
  "phone": "string (opcional, formato: +XX XXX XXX XXXX)",
  "email": "string (opcional, email válido)",
  "emergencyContact": "string (opcional, formato teléfono)",
  "address": "string (opcional, max 300 chars)",
  "city": "string (opcional, max 100 chars)",
  "postalCode": "string (opcional, 3-10 chars)",
  "clientType": "PERSONAL | COMPANY (requerido)",
  "preferredSchedule": "morning | afternoon | evening | flexible (opcional)",
  "notes": "string (opcional, max 1000 chars)",
  "isVip": "boolean (opcional, default: false)",
  "discount": "number (opcional, 0-100, default: 0)"
}
```

#### Validaciones Especiales
- Si `clientType` es "COMPANY", `companyName` es requerido
- Si `clientType` es "PERSONAL", `contactPerson` es requerido

#### Ejemplo de Request
```json
{
  "userId": "user_123",
  "companyName": "Norte Supermercados SAC",
  "contactPerson": "Luis García",
  "businessRegistration": "20123456789",
  "phone": "+51 945 678 123",
  "email": "contacto@nortesupermercados.com",
  "emergencyContact": "+51 987 654 321",
  "address": "Av. Los Pinos 123, San Isidro",
  "city": "Lima",
  "postalCode": "15036",
  "clientType": "COMPANY",
  "preferredSchedule": "morning",
  "notes": "Cliente corporativo con múltiples sucursales",
  "isVip": true,
  "discount": 15
}
```

#### Response (201)
```json
{
  "success": true,
  "message": "Perfil de cliente creado exitosamente",
  "data": {
    "id": "client_abc123",
    "userId": "user_123",
    "companyName": "Norte Supermercados SAC",
    "clientType": "COMPANY",
    "status": "ACTIVE",
    "isVip": true,
    "discount": 15,
    "createdAt": "2024-02-14T10:00:00.000Z",
    "user": {
      "id": "user_123",
      "username": "nortesupermercados",
      "email": "admin@nortesupermercados.com",
      "isActive": true
    }
  }
}
```

---

### 2. Obtener Todos los Clientes
**GET** `/api/clients`

Obtiene una lista paginada de clientes con filtros opcionales.

#### Permisos Requeridos
- `ADMIN`

#### Query Parameters
- `status` (opcional): `ACTIVE | INACTIVE | SUSPENDED | BLOCKED`
- `clientType` (opcional): `PERSONAL | COMPANY`
- `city` (opcional): Filtrar por ciudad
- `isVip` (opcional): `true | false` - Filtrar clientes VIP
- `search` (opcional): Búsqueda por nombre, empresa, email o username
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Clientes por página (default: 20, max: 100)

#### Ejemplo de Request
```
GET /api/clients?clientType=COMPANY&status=ACTIVE&isVip=true&page=1&limit=10
```

#### Response (200)
```json
{
  "success": true,
  "message": "Clientes obtenidos exitosamente",
  "data": [
    {
      "id": "client_abc123",
      "companyName": "Norte Supermercados SAC",
      "contactPerson": "Luis García",
      "clientType": "COMPANY",
      "status": "ACTIVE",
      "city": "Lima",
      "isVip": true,
      "discount": 15,
      "totalServices": 5,
      "nextServiceDate": "2024-02-20T10:00:00.000Z",
      "user": {
        "id": "user_123",
        "username": "nortesupermercados",
        "email": "admin@nortesupermercados.com",
        "isActive": true
      },
      "services": [
        // Últimos 5 servicios
      ],
      "equipment": [
        // Últimos 5 equipos
      ],
      "_count": {
        "services": 18,
        "equipment": 12,
        "quotes": 6
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalClients": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 3. Obtener Cliente por ID
**GET** `/api/clients/:id`

Obtiene información detallada de un cliente específico.

#### Permisos Requeridos
- `ADMIN`

#### Parameters
- `id`: ID del cliente

#### Response (200)
```json
{
  "success": true,
  "message": "Cliente obtenido exitosamente",
  "data": {
    "id": "client_abc123",
    "companyName": "Norte Supermercados SAC",
    "contactPerson": "Luis García",
    "businessRegistration": "20123456789",
    "phone": "+51 945 678 123",
    "email": "contacto@nortesupermercados.com",
    "emergencyContact": "+51 987 654 321",
    "address": "Av. Los Pinos 123, San Isidro",
    "city": "Lima",
    "postalCode": "15036",
    "clientType": "COMPANY",
    "status": "ACTIVE",
    "preferredSchedule": "morning",
    "nextServiceDate": "2024-02-20T10:00:00.000Z",
    "totalServices": 18,
    "notes": "Cliente corporativo con múltiples sucursales",
    "isVip": true,
    "discount": 15,
    "createdAt": "2024-02-01T10:00:00.000Z",
    "updatedAt": "2024-02-14T11:30:00.000Z",
    "user": {
      "id": "user_123",
      "username": "nortesupermercados",
      "email": "admin@nortesupermercados.com",
      "isActive": true
    },
    "services": [
      // Todos los servicios del cliente
    ],
    "equipment": [
      // Todos los equipos del cliente
    ],
    "quotes": [
      // Todas las cotizaciones del cliente
    ],
    "_count": {
      "services": 18,
      "equipment": 12,
      "quotes": 6
    }
  }
}
```

---

### 4. Buscar Clientes
**GET** `/api/clients/search`

Busca clientes por nombre, empresa, email o username.

#### Permisos Requeridos
- `ADMIN`

#### Query Parameters
- `q`: Término de búsqueda (requerido, 1-100 chars)
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 20, max: 100)

#### Ejemplo de Request
```
GET /api/clients/search?q=Norte&page=1&limit=5
```

#### Response (200)
```json
{
  "success": true,
  "message": "Búsqueda de clientes completada",
  "data": [
    // Array de clientes que coinciden con la búsqueda
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalClients": 2,
    "hasNext": false,
    "hasPrev": false
  },
  "searchTerm": "Norte"
}
```

---

### 5. Obtener Clientes VIP
**GET** `/api/clients/vip`

Obtiene todos los clientes con estatus VIP.

#### Permisos Requeridos
- `ADMIN`

#### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Clientes por página (default: 20)

#### Response (200)
```json
{
  "success": true,
  "message": "Clientes VIP obtenidos exitosamente",
  "data": [
    // Array de clientes VIP solamente
  ],
  "pagination": {
    // Información de paginación
  }
}
```

---

### 6. Obtener Clientes por Tipo
**GET** `/api/clients/type/:clientType`

Obtiene clientes filtrados por tipo (personal o company).

#### Permisos Requeridos
- `ADMIN`

#### Parameters
- `clientType`: `personal` o `company` (case-insensitive)

#### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Clientes por página (default: 20)

#### Ejemplo de Request
```
GET /api/clients/type/company?page=1&limit=10
```

#### Response (200)
```json
{
  "success": true,
  "message": "Clientes company obtenidos exitosamente",
  "data": [
    // Array de clientes empresariales
  ],
  "pagination": {
    // Información de paginación
  }
}
```

---

### 7. Obtener Perfil por User ID
**GET** `/api/clients/profile/:userId`

Obtiene el perfil de cliente asociado a un usuario específico.

#### Permisos Requeridos
- `ADMIN` o `CLIENT` (clientes solo pueden ver su propio perfil)

#### Parameters
- `userId`: ID del usuario

#### Response (200)
```json
{
  "success": true,
  "message": "Perfil de cliente obtenido exitosamente",
  "data": {
    // Información completa del cliente
    // Incluye servicios recientes (últimos 10)
  }
}
```

---

### 8. Actualizar Cliente
**PUT** `/api/clients/:id`

Actualiza información de un cliente existente.

#### Permisos Requeridos
- `ADMIN`

#### Parameters
- `id`: ID del cliente

#### Body (JSON)
Todos los campos son opcionales:
```json
{
  "companyName": "string (max 200 chars)",
  "contactPerson": "string (max 100 chars)",
  "businessRegistration": "string (8-20 chars)",
  "phone": "string (formato teléfono)",
  "email": "string (email válido)",
  "emergencyContact": "string (formato teléfono)",
  "address": "string (max 300 chars)",
  "city": "string (max 100 chars)",
  "postalCode": "string (3-10 chars)",
  "clientType": "PERSONAL | COMPANY",
  "status": "ACTIVE | INACTIVE | SUSPENDED | BLOCKED",
  "preferredSchedule": "morning | afternoon | evening | flexible",
  "nextServiceDate": "datetime ISO string",
  "notes": "string (max 1000 chars)",
  "isVip": "boolean",
  "discount": "number (0-100)"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Cliente actualizado exitosamente",
  "data": {
    // Cliente actualizado con cambios aplicados
  }
}
```

---

### 9. Obtener Estadísticas del Cliente
**GET** `/api/clients/:id/stats`

Obtiene estadísticas detalladas de un cliente específico.

#### Permisos Requeridos
- `ADMIN`

#### Parameters
- `id`: ID del cliente

#### Response (200)
```json
{
  "success": true,
  "message": "Estadísticas del cliente obtenidas exitosamente",
  "data": {
    "totalServices": 18,
    "equipmentCount": 12,
    "nextServiceDate": "2024-02-20T10:00:00.000Z",
    "memberSince": "2024-02-01T10:00:00.000Z",
    "servicesByStatus": {
      "pending": 2,
      "in_progress": 1,
      "completed": 15,
      "cancelled": 0
    },
    "quotesByStatus": {
      "pending": 1,
      "approved": 4,
      "rejected": 1,
      "expired": 0
    }
  }
}
```

---

### 10. Actualizar Estado del Cliente
**PATCH** `/api/clients/:id/status`

Cambia el estado de un cliente.

#### Permisos Requeridos
- `ADMIN`

#### Parameters
- `id`: ID del cliente

#### Body (JSON)
```json
{
  "status": "ACTIVE | INACTIVE | SUSPENDED | BLOCKED"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Estado del cliente actualizado exitosamente",
  "data": {
    // Cliente con estado actualizado
  }
}
```

---

### 11. Cambiar Estado VIP
**PATCH** `/api/clients/:id/vip`

Promueve o remueve el estatus VIP de un cliente.

#### Permisos Requeridos
- `ADMIN`

#### Parameters
- `id`: ID del cliente

#### Body (JSON)
```json
{
  "isVip": "boolean (requerido)",
  "discount": "number (opcional, 0-100)"
}
```

#### Ejemplo de Request
```json
{
  "isVip": true,
  "discount": 20
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Cliente promovido a VIP exitosamente",
  "data": {
    // Cliente con estado VIP actualizado
  }
}
```

---

### 12. Eliminar Cliente
**DELETE** `/api/clients/:id`

Elimina un cliente del sistema (soft delete - cambia estado a INACTIVE).

#### Permisos Requeridos
- `ADMIN`

#### Parameters
- `id`: ID del cliente

#### Response (200)
```json
{
  "success": true,
  "message": "Cliente eliminado exitosamente"
}
```

---

## Códigos de Error Comunes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "clientType",
      "message": "Para empresas se requiere nombre de empresa, para personas se requiere nombre de contacto"
    },
    {
      "field": "email",
      "message": "Formato de email inválido"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token no válido o expirado"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Cliente no encontrado"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "Error details (only in development)"
}
```

---

## Enums y Tipos de Datos

### ClientType
- `PERSONAL`: Cliente individual
- `COMPANY`: Cliente empresarial

### ClientStatus
- `ACTIVE`: Cliente activo
- `INACTIVE`: Cliente inactivo
- `SUSPENDED`: Cliente suspendido temporalmente
- `BLOCKED`: Cliente bloqueado

### PreferredSchedule
- `morning`: Mañana (8:00 - 12:00)
- `afternoon`: Tarde (12:00 - 18:00)
- `evening`: Noche (18:00 - 22:00)
- `flexible`: Horario flexible

---

## Ejemplos de Uso

### Workflow Típico de Gestión de Clientes

1. **Admin crea un cliente:**
   ```bash
   POST /api/clients
   # Status: ACTIVE por defecto
   ```

2. **Buscar clientes por criterios:**
   ```bash
   GET /api/clients?clientType=COMPANY&city=Lima&isVip=true
   ```

3. **Promover cliente a VIP:**
   ```bash
   PATCH /api/clients/{id}/vip
   # isVip: true, discount: 15
   ```

4. **Obtener estadísticas del cliente:**
   ```bash
   GET /api/clients/{id}/stats
   ```

### Filtros Avanzados

```bash
# Empresas VIP en Lima
GET /api/clients?clientType=COMPANY&city=Lima&isVip=true

# Búsqueda por nombre o empresa
GET /api/clients/search?q=Norte

# Clientes suspendidos
GET /api/clients?status=SUSPENDED

# Clientes por horario preferido
GET /api/clients?search=morning (en notes o preferredSchedule)
```

### Gestión de Estados

```bash
# Activar cliente
PATCH /api/clients/{id}/status
{"status": "ACTIVE"}

# Suspender cliente
PATCH /api/clients/{id}/status  
{"status": "SUSPENDED"}

# Promover a VIP con descuento
PATCH /api/clients/{id}/vip
{"isVip": true, "discount": 25}
```

---

## Colecciones de Prueba

- **Postman:** `tests/api/clients-api-tests.json`
- **Insomnia:** `tests/api/clients-insomnia-collection.json`

Ambas colecciones incluyen:
- Variables de entorno configurables
- Tests automatizados para validación
- Ejemplos de todos los endpoints
- Casos de validación de errores
- Flujos de trabajo completos

---

## Notas de Implementación

1. **Seguridad:** Todos los endpoints requieren autenticación JWT
2. **Validación:** Se usa Zod para validación estricta de datos
3. **Paginación:** Límite máximo de 100 clientes por página
4. **Soft Delete:** Los clientes eliminados cambian a estado INACTIVE
5. **Búsqueda:** Búsqueda insensible a mayúsculas/minúsculas
6. **Relaciones:** Incluye contadores automáticos de servicios, equipos y cotizaciones
7. **Performance:** Índices en campos de filtrado frecuente
8. **Business Rules:** Validaciones específicas según tipo de cliente (PERSONAL vs COMPANY)