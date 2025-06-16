# Integración con APIs de Supply

Este documento describe cómo el módulo de inventario se conecta con las APIs de Supply y SupplyRequest de Azure.

## Endpoints Utilizados

### Supply Endpoints
- `POST /api/v1/supply/create-supply` - Crear nuevo suministro
- `PUT /api/v1/supply/{id}` - Actualizar suministro existente
- `GET /api/v1/supply/{id}` - Obtener suministro por ID
- `GET /api/v1/supply/get-all-supplies` - Obtener todos los suministros
- `GET /api/v1/supply/provider/{providerId}` - Obtener suministros por proveedor

### SupplyRequest Endpoints
- `POST /api/v1/supply-request` - Crear solicitud de suministro
- `GET /api/v1/supply-request/hotelid/{hotelId}` - Obtener solicitudes por hotel
- `GET /api/v1/supply-request/{id}` - Obtener solicitud por ID
- `GET /api/v1/supply-request/paymentowner/{paymentOwnerId}` - Obtener solicitudes por pagador
- `GET /api/v1/supply-request/supply/{supplyId}` - Obtener solicitudes por suministro

## Modelos de Datos

### Supply
```typescript
interface Supply {
  id: number;
  providerId: number;
  hotelId: number;
  name: string;
  price: number;
  stock: number;
  state: string;
}
```

### SupplyRequest
```typescript
interface SupplyRequest {
  id: number;
  paymentOwnerId: number;
  supplyId: number;
  count: number;
  amount: number;
}
```

## Mapeo de Datos

La página de inventario mantiene compatibilidad con la UI existente mediante funciones de conversión:

### Supply → Inventory (UI)
```typescript
const convertSupplyToInventory = (supply: Supply) => ({
  id: supply.id,
  name: supply.name,
  type: supply.state,        // Estado se mapea como tipo
  unit_price: supply.price,  // Precio del supply
  stock: supply.stock
});
```

### Inventory (UI) → Supply
```typescript
const convertInventoryToSupply = (item: any, hotelId: number = 1, providerId: number = 1) => ({
  providerId,
  hotelId,
  name: item.name,
  price: item.unit_price || item.price || 0,
  stock: item.stock || 0,
  state: item.type || 'active'
});
```

## Autenticación

Todas las llamadas a la API requieren un token JWT que se obtiene del localStorage:

```typescript
const token = localStorage.getItem('auth_token');
```

El token se incluye en el header Authorization:
```typescript
headers: { 
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json"
}
```

## Funcionalidades Implementadas

### ✅ Listar Suministros
- Se obtienen todos los suministros usando `getAllSupplies()`
- Los datos se convierten al formato UI compatible
- Se muestran en tabla con filtros y búsqueda

### ✅ Crear Suministro
- Se usa `createSupply()` con los datos convertidos
- Incluye validación de campos requeridos
- Manejo de tipos personalizados

### ✅ Actualizar Suministro
- Se usa `updateSupply()` con datos parciales
- Preserva la estructura de datos original

### ✅ "Eliminar" Suministro
- Como no hay endpoint DELETE, se actualiza el estado a 'deleted'
- Se remueve de la UI local inmediatamente

### ✅ Estadísticas
- Cálculos locales de:
  - Total de items
  - Total de stock
  - Items con stock bajo
  - Valor total del inventario
  - Precio promedio

## Archivos Modificados

### Servicios
- `lib/services/supply-service.ts` - Servicio centralizado para APIs de Supply
- `lib/config/api.ts` - Configuración de endpoints

### Interfaces
- `types/interfaces.ts` - Agregado Supply y SupplyRequest

### UI
- `app/dashboard/inventory/page.tsx` - Página principal del inventario
- Componentes existentes mantienen compatibilidad

## Próximos Pasos

1. **Gestión de SupplyRequest**: Implementar UI para crear y gestionar solicitudes de suministros
2. **Proveedores**: Integrar gestión de proveedores si hay endpoints disponibles
3. **Estados avanzados**: Expandir los estados de Supply más allá de 'active'/'deleted'
4. **Validaciones**: Mejorar validaciones basadas en reglas de negocio del hotel
5. **Cache**: Implementar estrategias de cache para mejorar performance

## Notas Técnicas

- Se mantiene compatibilidad total con la UI existente
- El campo `state` de Supply se usa como `type` en la UI
- Los valores por defecto son: `hotelId=1`, `providerId=1`
- La "eliminación" es lógica (cambio de estado) no física
- Todos los precios se manejan como números decimales
