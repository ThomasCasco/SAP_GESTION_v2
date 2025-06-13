// ===== ENDPOINT PARA PRODUCTOS SAP =====
// Agregar este código a tu index.js después de los otros endpoints

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

// Endpoint adicional para estadísticas rápidas de productos
app.get('/api/productos-sap/stats', async (req, res) => {
    let pool;
    try {
        console.log('🔄 Obteniendo estadísticas de productos SAP...');
        pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .query(`
                SELECT 
                    COUNT(*) AS TotalProductos,
                    
                    -- Conteo por estado
                    SUM(CASE 
                        WHEN ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) <= 0 THEN 1 ELSE 0 
                    END) AS Criticos,
                    
                    SUM(CASE 
                        WHEN ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) > 0 AND ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) <= ISNULL(art.USR_STMPDH_STKSEG, 0) THEN 1 ELSE 0 
                    END) AS Precaucion,
                    
                    SUM(CASE 
                        WHEN ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) > ISNULL(art.USR_STMPDH_STKSEG, 0) 
                        AND ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) <= (ISNULL(art.USR_STMPDH_PNTREOR, 0) * 2) THEN 1 ELSE 0 
                    END) AS Normal,
                    
                    SUM(CASE 
                        WHEN ISNULL((
                            SELECT SUM(stm.STMCAM_CANTID) 
                            FROM STMCAM stm 
                            WHERE stm.STMCAM_ARTCOD = art.STMPDH_ARTCOD 
                            AND stm.STMCAM_TIPPRO = art.STMPDH_TIPPRO
                        ), 0) > (ISNULL(art.USR_STMPDH_PNTREOR, 0) * 2) THEN 1 ELSE 0 
                    END) AS Exceso
                    
                FROM STMPDH art
                WHERE art.STMPDH_TIPPRO IN ('TA', 'TC', 'TM')
                    AND art.STMPDH_ARTCOD IS NOT NULL
                    AND art.STMPDH_DESCRP IS NOT NULL
            `);

        const stats = result.recordset[0];
        
        saveLog('productos_sap_stats', {
            stats,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('❌ Error en /api/productos-sap/stats:', err.message);
        saveLog('productos_sap_stats_error', { 
            error: err.message, 
            ip: req.ip 
        });
        
        res.status(500).json({ 
            success: false,
            error: 'Error obteniendo estadísticas', 
            details: err.message 
        });
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}); 