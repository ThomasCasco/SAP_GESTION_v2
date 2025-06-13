# 🚀 Guía Completa para Subir a Vercel

## 📋 **PASO 1: Preparación Previa**

### **1.1 Agregar endpoint al servidor Express**
En tu servidor Express (index.js), agrega este código después de los otros endpoints:

```javascript
// ===== ENDPOINT PARA PRODUCTOS SAP =====
// Endpoint para obtener productos SAP con stock
app.get('/api/productos-sap', async (req, res) => {
    let pool;
    try {
        console.log('🔄 Conectando a SQL Server para productos SAP...');
        pool = await sql.connect(dbConfig);
        console.log('✅ Conexión exitosa para productos SAP');

        const result = await pool.request()
            .query(`
                SELECT DISTINCT 
                    art.STMPDH_ARTCOD AS CodigoDeArticulo,
                    art.STMPDH_DESCRP AS DescripcionArticulo,
                    
                    -- Stock actual del producto
                    ISNULL((
                        SELECT SUM(stm.STMCAM_CANTID) 
                        FROM STMCAM stm 
                        WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                        AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                    ), 0) AS StockProducto,
                    
                    -- Stock de seguridad
                    ISNULL(art.USR_STMPDH_STKSEG, 0) AS StockSeguridad,
                    
                    -- Punto de reorden  
                    ISNULL(art.USR_STMPDH_PNTREOR, 0) AS PuntoDeReOrden,
                    
                    -- Cálculo del estado de stock
                    CASE 
                        WHEN ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) <= 0 THEN 'Critico'
                        
                        WHEN ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) <= ISNULL(art.USR_STMPDH_STKSEG, 0) THEN 'Precaucion'
                        
                        WHEN ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) > (ISNULL(art.USR_STMPDH_PNTREOR, 0) * 2) THEN 'Sobre Produccion'
                        
                        ELSE 'Dentro del rango'
                    END AS EstadoStock,
                    
                    -- Información adicional
                    art.STMPDH_TIPPRO AS TipoProducto,
                    art.STMPDH_UNIMED AS UnidadMedida,
                    
                    -- Última fecha de movimiento
                    (SELECT TOP 1 stm.STMCAM_FCHVTO 
                     FROM STMCAM stm 
                     WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                     AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                     ORDER BY stm.STMCAM_FCHVTO DESC) AS UltimaFechaMovimiento,
                    
                    -- Promedio de stock
                    CASE 
                        WHEN ISNULL(art.USR_STMPDH_STKSEG, 0) > 0 AND ISNULL(art.USR_STMPDH_PNTREOR, 0) > 0
                        THEN (ISNULL(art.USR_STMPDH_STKSEG, 0) + ISNULL(art.USR_STMPDH_PNTREOR, 0)) / 2
                        ELSE 0
                    END AS PromedioStock

                FROM STMPDH art
                WHERE art.STMPDH_TIPPRO IN ('TA', 'TC', 'TM')
                    AND art.STMPDH_ARTCOD IS NOT NULL
                    AND art.STMPDH_DESCRP IS NOT NULL
                    AND LEN(TRIM(art.STMPDH_ARTCOD)) > 0
                    AND LEN(TRIM(art.STMPDH_DESCRP)) > 0
                    
                ORDER BY 
                    -- Ordenar por criticidad: primero críticos, luego precaución, etc.
                    CASE 
                        WHEN ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) <= 0 THEN 1
                        
                        WHEN ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) <= ISNULL(art.USR_STMPDH_STKSEG, 0) THEN 2
                        
                        WHEN ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) > (ISNULL(art.USR_STMPDH_PNTREOR, 0) * 2) THEN 4
                        
                        ELSE 3
                    END,
                    art.STMPDH_DESCRP
            `);

        console.log('✅ Consulta de productos ejecutada, filas devueltas:', result.recordset.length);
        
        // Procesar los datos para asegurar formato consistente
        const productos = result.recordset.map(producto => ({
            ...producto,
            StockProducto: parseFloat(producto.StockProducto) || 0,
            StockSeguridad: parseFloat(producto.StockSeguridad) || 0,
            PuntoDeReOrden: parseFloat(producto.PuntoDeReOrden) || 0,
            PromedioStock: parseFloat(producto.PromedioStock) || 0
        }));
        
        // Guardar log de la consulta
        saveLog('productos_sap_consulta', {
            filas: productos.length,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            data: productos,
            total: productos.length,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('❌ Error en /api/productos-sap:', err.message);
        
        // Guardar log de error
        saveLog('productos_sap_error', { 
            error: err.message, 
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({ 
            success: false,
            error: 'Error en el servidor', 
            details: err.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (pool) {
            try {
                await pool.close();
                console.log('🔒 Pool SQL cerrado para productos SAP');
            } catch (closeError) {
                console.error('Error cerrando pool:', closeError);
            }
        }
    }
});
```

### **1.2 Configurar ngrok en tu servidor**
1. **Instalar ngrok** (si no lo tienes):
   ```bash
   # Windows
   winget install ngrok

   # O descargar desde: https://ngrok.com/download
   ```

2. **Exponer el puerto 4353**:
   ```bash
   ngrok http 4353
   ```

3. **Anotar la URL generada** (ejemplo: `https://abc123.ngrok-free.app`)

---

## 📋 **PASO 2: Configurar la Aplicación Next.js**

### **2.1 Instalar dependencias sin mssql**
```bash
npm install
```

### **2.2 Configurar variables de entorno**
Crea el archivo `.env.local`:
```bash
# URL del servidor Express con ngrok
EXPRESS_SERVER_URL=https://tu-url-ngrok.ngrok-free.app
```

### **2.3 Probar localmente**
```bash
npm run dev
```
- Verificar que se conecte correctamente al servidor Express
- Confirmar que los productos se cargan correctamente

---

## 🚀 **PASO 3: Subir a Vercel**

### **3.1 Preparar el repositorio**
Si no tienes Git configurado:
```bash
git init
git add .
git commit -m "Aplicación SAP lista para Vercel"
```

### **3.2 Subir a GitHub (recomendado)**
1. **Crear repositorio en GitHub**
2. **Conectar y subir**:
   ```bash
   git remote add origin https://github.com/tu-usuario/sap-stock-app.git
   git branch -M main
   git push -u origin main
   ```

### **3.3 Configurar Vercel**

#### **Método 1: Vercel CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Configurar proyecto
vercel

# Seguir prompts:
# - Set up and deploy? Y
# - Which scope? (tu cuenta)
# - Link to existing project? N
# - Project name: sap-stock-management
# - Directory: ./
# - Override settings? N
```

#### **Método 2: Vercel Dashboard**
1. Ir a [vercel.com](https://vercel.com)
2. **Import Git Repository**
3. **Seleccionar tu repositorio GitHub**
4. **Configure Project**:
   - Project Name: `sap-stock-management`
   - Framework Preset: `Next.js`
   - Root Directory: `./`

### **3.4 Configurar Variables de Entorno en Vercel**
En el dashboard de Vercel:
1. **Project Settings** → **Environment Variables**
2. **Agregar**:
   ```
   Name: EXPRESS_SERVER_URL
   Value: https://tu-url-ngrok.ngrok-free.app
   Environment: Production, Preview, Development
   ```

### **3.5 Deploy**
```bash
vercel --prod
```

---

## 🔧 **PASO 4: Configuración Post-Deploy**

### **4.1 Actualizar CORS en el servidor Express**
En tu `index.js`, asegurar que incluya la URL de Vercel:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'https://tu-app.vercel.app', // ← AGREGAR ESTA LÍNEA
    'https://conforma-remitos.vercel.app',
    /.*\.ngrok\.io$/,
    /.*\.ngrok-free\.app$/,
    /.*\.loca\.lt$/,
    /.*\.vercel\.app$/ // ← AGREGAR ESTA LÍNEA
  ],
  credentials: true
}));
```

### **4.2 Mantener ngrok activo**
Para producción estable, considera:
- **ngrok Pro**: URL permanente
- **Servidor en la nube**: AWS, DigitalOcean, etc.
- **VPN**: Conexión directa al servidor de la empresa

---

## 🧪 **PASO 5: Testing y Validación**

### **5.1 Probar la aplicación en Vercel**
1. **Abrir la URL de Vercel**
2. **Probar login** con los usuarios:
   - `admin` / `password123`
   - `alex.kruszewski` / `Imsa.2025!`
   - `thomas.casco` / `Haru.2025`
   - `juan.duran` / `imsa.2025`

3. **Verificar**:
   - ✅ Carga de productos
   - ✅ KPIs dinámicos
   - ✅ Grilla responsive
   - ✅ Filtros funcionando

### **5.2 Monitorear logs**
- **Vercel**: Functions → View Function Logs
- **Servidor Express**: Logs de consola
- **ngrok**: Dashboard para ver requests

---

## 🎯 **Flujo Final de Arquitectura**

```
Usuario → Vercel App → ngrok URL → Tu Servidor Express → SQL Server
```

### **URLs de ejemplo:**
- **Aplicación**: `https://sap-stock-management.vercel.app`
- **API ngrok**: `https://abc123.ngrok-free.app/api/productos-sap`
- **Servidor local**: `192.168.100.50:4353`

---

## 🚨 **Solución de Problemas**

### **Error: "fetch failed"**
- Verificar que ngrok esté ejecutándose
- Comprobar URL en variables de entorno
- Verificar CORS en servidor Express

### **Error: "Timeout"**
- Aumentar timeout en el código
- Verificar conectividad de red
- Comprobar que SQL Server esté accesible

### **Error: "Invalid response"**
- Verificar formato de respuesta del servidor
- Comprobar logs del servidor Express
- Validar estructura de datos

---

## 📞 **Soporte**

Si necesitas ayuda:
1. **Verificar logs** en Vercel y servidor
2. **Comprobar variables** de entorno
3. **Validar conectividad** ngrok → servidor → SQL

**¡Tu aplicación SAP está lista para el mundo! 🌍** 