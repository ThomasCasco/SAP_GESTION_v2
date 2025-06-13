# Panel de Stock de Productos SAP

Sistema web de gestión de inventario para productos SAP con conexión a SQL Server, desarrollado con Next.js, Tailwind CSS y AG Grid.

## 🚀 Características

- **Conexión SQL Server**: Integración con base de datos CWSGImsa usando autenticación NTLM
- **Dashboard Interactivo**: KPIs en tiempo real y grilla de productos ordenable/filtrable
- **Sistema de Autenticación**: Login simple con credenciales hardcodeadas
- **Interfaz Moderna**: Diseño responsivo con Tailwind CSS
- **AG Grid**: Tabla avanzada con ordenamiento, filtrado y paginación
- **Estados de Stock**: Visualización por colores (Crítico, Precaución, Normal, Sobreproducción)

## 📋 Requisitos Previos

- Node.js 16.x o superior
- npm o yarn
- Acceso a SQL Server (192.168.100.164)
- Puerto 3000 disponible

## 🛠️ Instalación Local

### 1. Clonar el proyecto
```bash
git clone <repository-url>
cd sap-stock-management
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local` en la raíz del proyecto:

```env
# Configuración de Base de Datos
DB_SERVER=192.168.100.164
DB_DATABASE=CWSGImsa
DB_DOMAIN=IMSA
DB_USERNAME=A_TCasco
DB_PASSWORD=Tiranytar.2023!

# Configuración de Next.js
NODE_ENV=development
```

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en: http://localhost:3000

## 🔐 Credenciales de Acceso

**Usuario:** admin  
**Contraseña:** password123

## 📊 Funcionalidades

### KPIs Disponibles
- **Productos Críticos**: Cantidad de productos con stock crítico
- **Productos en Precaución**: Cantidad con stock bajo
- **Promedio de Stock**: Stock promedio por producto
- **Con Despachos Pendientes**: Porcentaje con despachos pendientes
- **Última NE-C-Cables**: Fecha más reciente

### Estados de Stock
- 🔴 **Crítico**: Stock por debajo del mínimo
- 🟡 **Precaución**: Stock entre mínimo y punto de reorden
- 🟢 **Dentro del rango**: Stock normal
- 🔵 **Sobreproducción**: Stock por encima del máximo

### Grilla de Productos
- **Filtrado**: Por descripción o código de artículo
- **Ordenamiento**: Por cualquier columna
- **Paginación**: 25, 50, 100, 200 registros por página
- **Columnas**:
  - Descripción del Artículo
  - Código de Artículo
  - Unidad de Medida
  - Stock Máximo/Seguridad/Actual
  - Punto de Reorden
  - Factor de Conversión
  - Despachos Pendientes
  - Órdenes de Producción Pendientes
  - Última NE-C-Cables
  - Estado de Stock

## 🗄️ Consulta SQL

La aplicación ejecuta la siguiente consulta para obtener los datos:

```sql
SELECT 
    STMPDH.STMPDH_DESCRP as DescripcionArticulo,
    USR_STMPDS.USR_STMPDS_ARTCOD as CodigoDeArticulo,
    STMPDH.STMPDH_UNIMED as UnidadDeMedida,
    USR_STMPDS.USR_STMPDS_STKMAX as StockMaximo,
    USR_STMPDS.USR_STMPDS_STKMIN as StockSeguridad,
    USR_STMPDS.USR_STMPDS_PTOREO as PuntoDeReOrden,
    STMPDH.STMPDH_FACCON as FactorDeConversion,
    (SUM(STRMVK_STOCKS)) AS [StockProducto],
    -- ... más campos
FROM STRMVK 
INNER JOIN STMPDH ON ...
INNER JOIN USR_STMPDS ON ...
WHERE STRMVK.STRMVK_TIPPRO = 'TC'
AND STRMVK_DEPOSI = 'B'
-- ... más condiciones
ORDER BY 
    CASE EstadoStock 
        WHEN 'Critico' THEN 1 
        WHEN 'Precaucion' THEN 2 
        WHEN 'Dentro del rango' THEN 3 
        WHEN 'Sobre Produccion' THEN 4 
    END ASC
```

## 🚀 Despliegue en Vercel

### 1. Configurar proyecto en Vercel
```bash
npm install -g vercel
vercel login
vercel
```

### 2. Configurar variables de entorno en Vercel
En el dashboard de Vercel, agregar las variables:
- `DB_SERVER`
- `DB_DATABASE`
- `DB_DOMAIN`
- `DB_USERNAME`
- `DB_PASSWORD`

### 3. Deploy automático
```bash
vercel --prod
```

## 📁 Estructura del Proyecto

```
├── components/
│   ├── Layout.js           # Layout principal con autenticación
│   ├── LoginForm.js        # Formulario de login
│   ├── ProductGrid.js      # Grilla de productos con AG Grid
│   └── KPICards.js         # Tarjetas de KPIs
├── pages/
│   ├── api/
│   │   ├── auth.js         # API de autenticación
│   │   └── products.js     # API de productos SQL Server
│   ├── _app.js             # Configuración global de Next.js
│   ├── index.js            # Página de inicio
│   ├── login.js            # Página de login
│   └── dashboard.js        # Dashboard principal
├── styles/
│   └── globals.css         # Estilos globales y Tailwind
├── utils/
│   └── auth.js             # Utilidades de autenticación
├── package.json
├── tailwind.config.js
├── next.config.js
├── vercel.json
└── README.md
```

## 🔧 APIs Disponibles

### POST /api/auth
Autenticación de usuario
```javascript
// Request
{
  "username": "admin",
  "password": "password123"
}

// Response
{
  "success": true,
  "token": "authenticated",
  "message": "Autenticación exitosa"
}
```

### GET /api/products
Obtener productos de SQL Server
```javascript
// Response
{
  "success": true,
  "data": [...],
  "count": 150,
  "message": "Productos obtenidos exitosamente"
}
```

## 🛡️ Seguridad

- Autenticación basada en cookies con tokens de sesión
- Variables de entorno para credenciales de base de datos
- Conexión SQL Server con autenticación NTLM
- Validación de entrada en APIs

## 🐛 Troubleshooting

### Error de conexión a SQL Server
1. Verificar conectividad de red al servidor
2. Confirmar credenciales NTLM
3. Revisar configuración de firewall
4. Verificar que el servicio SQL Server esté activo

### Problemas de dependencias
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Errores de build en Vercel
1. Verificar variables de entorno
2. Confirmar compatibilidad de Node.js
3. Revisar logs de deploy

## 📈 Performance

- Pool de conexiones SQL Server optimizado
- Lazy loading de componentes
- Memoización de cálculos de KPIs
- Paginación en grilla para grandes datasets

## 🔄 Actualización de Datos

- Los datos se cargan automáticamente al iniciar
- Botón de actualización manual disponible
- Los KPIs se recalculan dinámicamente con filtros

## 📝 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

Para soporte técnico o consultas:
- Crear issue en GitHub
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para la gestión eficiente de inventarios SAP** 