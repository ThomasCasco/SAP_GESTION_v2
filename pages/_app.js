import '../styles/globals.css';
import Head from 'next/head';

/**
 * App component principal de Next.js
 * Aquí se configuran estilos globales y metadatos
 */
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Panel de Stock SAP - Sistema de Gestión de Inventario</title>
        <meta name="description" content="Sistema de gestión de stock para productos SAP con monitoreo en tiempo real" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 