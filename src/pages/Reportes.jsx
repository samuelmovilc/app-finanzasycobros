import React, { useState } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { FileText, Download, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reportes = () => {
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loadingTrans, setLoadingTrans] = useState(false);
  const [errorLoans, setErrorLoans] = useState('');
  const [errorTrans, setErrorTrans] = useState('');

  const generateLoansReport = async () => {
    setLoadingLoans(true);
    setErrorLoans('');
    try {
      const res = await api.get('/loans');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Reporte de Préstamos Activos', 14, 22);
      doc.setFontSize(11);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableColumn = ["ID", "Cliente", "Capital", "Interés", "Estado", "Fecha Creación"];
      const tableRows = [];

      const loansData = Array.isArray(res.data) ? res.data : [];

      if (loansData.length === 0) {
          tableRows.push(["-", "No hay préstamos registrados", "-", "-", "-", "-"]);
      } else {
          loansData.forEach(loan => {
            const loanData = [
              loan.id || '-',
              loan.client_name || 'Desconocido',
              `$${Number(loan.capital_amount || 0).toLocaleString()}`,
              `${loan.interest_rate || 0}%`,
              loan.status || 'N/A',
              loan.created_at ? new Date(loan.created_at).toLocaleDateString() : 'N/A'
            ];
            tableRows.push(loanData);
          });
      }

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
      });

      doc.save(`reporte_prestamos_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generando reporte de préstamos:', error);
      setErrorLoans('No se pudo generar el reporte. ' + (error.response?.data?.error || 'Intenta de nuevo.'));
    } finally {
      setLoadingLoans(false);
    }
  };

  const generateTransactionsReport = async () => {
    setLoadingTrans(true);
    setErrorTrans('');
    try {
      const res = await api.get('/transactions');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Reporte de Ingresos y Egresos', 14, 22);
      doc.setFontSize(11);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableColumn = ["ID", "Fecha", "Concepto", "Tipo", "Monto"];
      const tableRows = [];

      const transData = Array.isArray(res.data) ? res.data.filter(t => t.status !== 'ANULADO') : [];

      if (transData.length === 0) {
          tableRows.push(["-", "-", "No hay transacciones registradas", "-", "-"]);
      } else {
          transData.forEach(t => {
            const tData = [
              t.id || '-',
              t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A',
              t.concept || 'Sin concepto',
              t.type || 'N/A',
              `$${Number(t.amount || 0).toLocaleString()}`
            ];
            tableRows.push(tData);
          });
      }

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
      });

      doc.save(`reporte_transacciones_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generando reporte de transacciones:', error);
      setErrorTrans('No se pudo generar el reporte. ' + (error.response?.data?.error || 'Intenta de nuevo.'));
    } finally {
      setLoadingTrans(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>Reportes Financieros</h1>
            <p>Generación de documentos PDF</p>
          </div>
        </header>

        <section className="analysis-section" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          
          <div className="card summary-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
            <FileText size={48} style={{ color: 'var(--accent-primary)', marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Cartera de Préstamos</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
              Descarga un listado completo de todos los préstamos registrados en el sistema, detallando el capital prestado y estado actual.
            </p>
            {errorLoans && (
                <div style={{ color: 'var(--accent-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <AlertCircle size={18} />
                    <span style={{ fontSize: '0.9rem' }}>{errorLoans}</span>
                </div>
            )}
            <button className="btn btn-primary" onClick={generateLoansReport} disabled={loadingLoans} style={{ width: '100%', justifyContent: 'center' }}>
              <Download size={18} style={{ marginRight: '10px' }} /> 
              {loadingLoans ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>

          <div className="card summary-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
            <FileText size={48} style={{ color: 'var(--accent-success)', marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Transacciones Generales</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
              Extrae un listado histórico de todos los ingresos de capital, pagos recibidos, y egresos manuales del sistema.
            </p>
            {errorTrans && (
                <div style={{ color: 'var(--accent-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <AlertCircle size={18} />
                    <span style={{ fontSize: '0.9rem' }}>{errorTrans}</span>
                </div>
            )}
            <button className="btn btn-primary" onClick={generateTransactionsReport} disabled={loadingTrans} style={{ width: '100%', backgroundColor: 'var(--accent-success)', justifyContent: 'center' }}>
              <Download size={18} style={{ marginRight: '10px' }} /> 
              {loadingTrans ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>

        </section>
      </main>
    </div>
  );
};

export default Reportes;
