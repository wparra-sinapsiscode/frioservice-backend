# FrioService - API de Servicios

## Información General

La API de Servicios permite gestionar todos los aspectos relacionados con los servicios de refrigeración, incluyendo creación, asignación de técnicos, seguimiento y completado de servicios.

**Base URL:** `http://localhost:3001/api/services`

**Autenticación:** Todas las rutas requieren token JWT válido en el header `Authorization: Bearer <token>`

---

## Endpoints Disponibles

### 1. Crear Servicio
**POST** `/api/services`

Crea un nuevo servicio en el sistema.

#### Permisos Requeridos
- `ADMIN` o `CLIENT`

#### Body (JSON)
```json
{
  "title": "string (requerido, max 200 chars)",
  "description": "string (opcional, max 1000 chars)",
  "clientId": "string (requerido)",
  "technicianId": "string (opcional)",
  "type": "MAINTENANCE | REPAIR | INSTALLATION | INSPECTION | EMERGENCY | CLEANING | CONSULTATION",
  "priority": "LOW | MEDIUM | HIGH | URGENT (default: MEDIUM)",
  "scheduledDate": "datetime ISO string (requerido)",
  "estimatedDuration": "number (opcional, 15-480 minutos)",
  "equipmentIds": "array of strings (opcional)",
  "address": "string (requerido, max 500 chars)",
  "contactPhone": "string (requerido, formato: +XX XXX XXX XXXX)",
  "emergencyContact": "string (opcional, mismo formato que contactPhone)",
  "accessInstructions": "string (opcional, max 500 chars)",
  "clientNotes": "string (opcional, max 1000 chars)"
}
```

#### Ejemplo de Request
```json
{
  "title": "Mantenimiento Aires Acondicionados",
  "description": "Mantenimiento preventivo de 3 unidades",
  "clientId": "client_123",
  "type": "MAINTENANCE",
  "priority": "MEDIUM",
  "scheduledDate": "2024-02-15T10:00:00.000Z",
  "estimatedDuration": 120,
  "address": "Calle 123 #45-67, Bogotá",
  "contactPhone": "+57 300 123 4567",
  "emergencyContact": "+57 300 765 4321",
  "accessInstructions": "Tocar timbre del apartamento 301",
  "clientNotes": "Los equipos presentan ruido excesivo"
}
```

#### Response (201)
```json
{
  "success": true,
  "message": "Servicio creado exitosamente",
  "data": {
    "id": "service_abc123",
    "title": "Mantenimiento Aires Acondicionados",
    "status": "PENDING",
    "createdAt": "2024-02-14T10:00:00.000Z",
    // ... resto de campos
  }
}
```

---

### 2. Obtener Todos los Servicios
**GET** `/api/services`

Obtiene una lista paginada de servicios con filtros opcionales.

#### Permisos Requeridos
- `ADMIN` o `TECHNICIAN`

#### Query Parameters
- `status` (opcional): `PENDING | CONFIRMED | IN_PROGRESS | ON_HOLD | COMPLETED | CANCELLED`
- `type` (opcional): `MAINTENANCE | REPAIR | INSTALLATION | INSPECTION | EMERGENCY | CLEANING | CONSULTATION`
- `priority` (opcional): `LOW | MEDIUM | HIGH | URGENT`
- `clientId` (opcional): ID del cliente
- `technicianId` (opcional): ID del técnico
- `startDate` (opcional): Fecha de inicio (ISO string)
- `endDate` (opcional): Fecha de fin (ISO string)
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Servicios por página (default: 20, max: 100)

#### Ejemplo de Request
```
GET /api/services?status=PENDING&type=MAINTENANCE&page=1&limit=10
```

#### Response (200)
```json
{
  "success": true,
  "message": "Servicios obtenidos exitosamente",
  "data": [
    {
      "id": "service_abc123",
      "title": "Mantenimiento Aires Acondicionados",
      "status": "PENDING",
      "client": {
        "id": "client_123",
        "name": "Juan Pérez"
      },
      // ... resto de campos
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalServices": 47,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 3. Obtener Servicio por ID
**GET** `/api/services/:id`

Obtiene información detallada de un servicio específico.

#### Permisos Requeridos
- `ADMIN`, `TECHNICIAN` o `CLIENT` (clientes solo pueden ver sus propios servicios)

#### Parameters
- `id`: ID del servicio

#### Response (200)
```json
{
  "success": true,
  "message": "Servicio obtenido exitosamente",
  "data": {
    "id": "service_abc123",
    "title": "Mantenimiento Aires Acondicionados",
    "description": "Mantenimiento preventivo de 3 unidades",
    "status": "IN_PROGRESS",
    "type": "MAINTENANCE",
    "priority": "MEDIUM",
    "scheduledDate": "2024-02-15T10:00:00.000Z",
    "client": {
      "id": "client_123",
      "name": "Juan Pérez",
      "email": "juan@email.com"
    },
    "technician": {
      "id": "tech_456",
      "name": "Carlos González",
      "specialization": "Aires Acondicionados"
    },
    "equipment": [
      {
        "id": "eq_789",
        "type": "Aire Acondicionado",
        "brand": "LG",
        "model": "Split 12000 BTU"
      }
    ],
    "createdAt": "2024-02-14T10:00:00.000Z",
    "updatedAt": "2024-02-14T11:30:00.000Z"
  }
}
```

---

### 4. Actualizar Servicio
**PUT** `/api/services/:id`

Actualiza información de un servicio existente.

#### Permisos Requeridos
- `ADMIN` o `TECHNICIAN`

#### Parameters
- `id`: ID del servicio

#### Body (JSON)
Todos los campos son opcionales:
```json
{
  "title": "string (max 200 chars)",
  "description": "string (max 1000 chars)",
  "technicianId": "string",
  "status": "PENDING | CONFIRMED | IN_PROGRESS | ON_HOLD | COMPLETED | CANCELLED",
  "type": "MAINTENANCE | REPAIR | INSTALLATION | INSPECTION | EMERGENCY | CLEANING | CONSULTATION",
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "scheduledDate": "datetime ISO string",
  "estimatedDuration": "number (15-480 minutos)",
  "equipmentIds": "array of strings",
  "address": "string (max 500 chars)",
  "contactPhone": "string",
  "emergencyContact": "string",
  "accessInstructions": "string (max 500 chars)",
  "clientNotes": "string (max 1000 chars)"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    // ... servicio actualizado
  }
}
```

---

### 5. Asignar Técnico
**PATCH** `/api/services/:id/assign`

Asigna un técnico a un servicio específico.

#### Permisos Requeridos
- `ADMIN`

#### Parameters
- `id`: ID del servicio

#### Body (JSON)
```json
{
  "technicianId": "string (requerido)"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Técnico asignado exitosamente",
  "data": {
    // ... servicio con técnico asignado
  }
}
```

---

### 6. Completar Servicio
**PATCH** `/api/services/:id/complete`

Marca un servicio como completado con detalles del trabajo realizado.

#### Permisos Requeridos
- `ADMIN` o `TECHNICIAN`

#### Parameters
- `id`: ID del servicio

#### Body (JSON)
```json
{
  "workPerformed": "string (requerido, max 2000 chars)",
  "timeSpent": "number (requerido, 1-1440 minutos)",
  "materialsUsed": [
    {
      "name": "string (requerido)",
      "quantity": "number (requerido, >= 0)",
      "unit": "string (requerido)",
      "cost": "number (opcional, >= 0)"
    }
  ],
  "technicianNotes": "string (opcional, max 1000 chars)",
  "clientSignature": "string (requerido, base64 image)",
  "images": ["array of strings (opcional, URLs)"]
}
```

#### Ejemplo de Request
```json
{
  "workPerformed": "Se realizó mantenimiento preventivo completo de 3 unidades de aire acondicionado.",
  "timeSpent": 180,
  "materialsUsed": [
    {
      "name": "Filtro de aire",
      "quantity": 3,
      "unit": "unidades",
      "cost": 25000
    },
    {
      "name": "Refrigerante R410A",
      "quantity": 1,
      "unit": "libra",
      "cost": 45000
    }
  ],
  "technicianNotes": "Todos los equipos funcionando correctamente.",
  "clientSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Servicio completado exitosamente",
  "data": {
    // ... servicio completado con status: "COMPLETED"
  }
}
```

---

### 7. Servicios por Cliente
**GET** `/api/services/client/:clientId`

Obtiene todos los servicios de un cliente específico.

#### Permisos Requeridos
- `ADMIN` o `CLIENT` (clientes solo pueden ver sus propios servicios)

#### Parameters
- `clientId`: ID del cliente

#### Query Parameters
- `status` (opcional): Filtrar por estado
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Servicios por página (default: 20)

#### Response (200)
```json
{
  "success": true,
  "message": "Servicios del cliente obtenidos exitosamente",
  "data": [
    // ... array de servicios del cliente
  ],
  "pagination": {
    // ... información de paginación
  }
}
```

---

### 8. Servicios por Técnico
**GET** `/api/services/technician/:technicianId`

Obtiene todos los servicios asignados a un técnico específico.

#### Permisos Requeridos
- `ADMIN` o `TECHNICIAN` (técnicos solo pueden ver sus propios servicios)

#### Parameters
- `technicianId`: ID del técnico

#### Query Parameters
- `status` (opcional): Filtrar por estado
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Servicios por página (default: 20)

#### Response (200)
```json
{
  "success": true,
  "message": "Servicios del técnico obtenidos exitosamente",
  "data": [
    // ... array de servicios del técnico
  ],
  "pagination": {
    // ... información de paginación
  }
}
```

---

### 9. Eliminar Servicio
**DELETE** `/api/services/:id`

Elimina un servicio del sistema.

#### Permisos Requeridos
- `ADMIN`

#### Parameters
- `id`: ID del servicio

#### Response (200)
```json
{
  "success": true,
  "message": "Servicio eliminado exitosamente"
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
      "field": "title",
      "message": "El título es requerido"
    },
    {
      "field": "contactPhone",
      "message": "Formato de teléfono inválido"
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
  "message": "Servicio no encontrado"
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

### ServiceType
- `MAINTENANCE`: Mantenimiento
- `REPAIR`: Reparación
- `INSTALLATION`: Instalación
- `INSPECTION`: Inspección
- `EMERGENCY`: Emergencia
- `CLEANING`: Limpieza
- `CONSULTATION`: Consultoría

### ServicePriority
- `LOW`: Baja
- `MEDIUM`: Media
- `HIGH`: Alta
- `URGENT`: Urgente

### ServiceStatus
- `PENDING`: Pendiente
- `CONFIRMED`: Confirmado
- `IN_PROGRESS`: En progreso
- `ON_HOLD`: En espera
- `COMPLETED`: Completado
- `CANCELLED`: Cancelado

---

## Ejemplos de Uso

### Workflow Típico

1. **Cliente crea un servicio:**
   ```bash
   POST /api/services
   # Status: PENDING
   ```

2. **Admin asigna técnico:**
   ```bash
   PATCH /api/services/{id}/assign
   # Status: CONFIRMED
   ```

3. **Técnico actualiza estado:**
   ```bash
   PUT /api/services/{id}
   # Status: IN_PROGRESS
   ```

4. **Técnico completa servicio:**
   ```bash
   PATCH /api/services/{id}/complete
   # Status: COMPLETED
   ```

### Filtros Avanzados

```bash
# Servicios urgentes pendientes de esta semana
GET /api/services?priority=URGENT&status=PENDING&startDate=2024-02-12T00:00:00.000Z&endDate=2024-02-18T23:59:59.999Z

# Mantenimientos completados del técnico
GET /api/services/technician/tech_456?type=MAINTENANCE&status=COMPLETED

# Servicios del cliente con paginación
GET /api/services/client/client_123?page=2&limit=5
```

---

## Colecciones de Prueba

- **Postman:** `tests/api/services-api-tests.json`
- **Insomnia:** `tests/api/services-insomnia-collection.json`

Ambas colecciones incluyen:
- Variables de entorno configurables
- Tests automatizados
- Ejemplos de todos los endpoints
- Casos de validación de errores

---

## Notas de Implementación

1. **Seguridad:** Todos los endpoints requieren autenticación JWT
2. **Validación:** Se usa Zod para validación estricta de datos
3. **Paginación:** Límite máximo de 100 servicios por página
4. **Fechas:** Todas las fechas en formato ISO 8601
5. **Archivos:** Las imágenes se almacenan como URLs o base64
6. **Performance:** Índices en campos de filtrado frecuente