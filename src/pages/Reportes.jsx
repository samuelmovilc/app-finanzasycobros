import React, { useState } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reportes = () => {
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loadingTrans, setLoadingTrans] = useState(false);

  const generateLoansReport = async () => {
    setLoadingLoans(true);
    try {
      const res = await api.get('/loans');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Reporte de Préstamos Activos', 14, 22);
      doc.setFontSize(11);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableColumn = ["ID", "Cliente", "Capital", "Interés", "Estado", "Fecha Creación"];
      const tableRows = [];

      res.data.forEach(loan => {
        const loanData = [
          loan.id,
          loan.client_name,
          `$${Number(loan.capital_amount).toLocaleString()}`,
          `${loan.interest_rate}%`,
          loan.status,
          new Date(loan.created_at).toLocaleDateString()
        ];
        tableRows.push(loanData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
      });

      doc.save(`reporte_prestamos_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generando reporte', error);
      alert('Error al generar el reporte.');
    } finally {
      setLoadingLoans(false);
    }
  };

  const generateTransactionsReport = async () => {
    setLoadingTrans(true);
    try {
      const res = await api.get('/transactions');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Reporte de Ingresos y Egresos', 14, 22);
      doc.setFontSize(11);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableColumn = ["ID", "Fecha", "Concepto", "Tipo", "Monto"];
      const tableRows = [];

      res.data.forEach(t => {
        const tData = [
          t.id,
          new Date(t.created_at).toLocaleDateString(),
          t.concept,
          t.type,
          `$${Number(t.amount).toLocaleString()}`
        ];
        tableRows.push(tData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
      });

      doc.save(`reporte_transacciones_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generando reporte', error);
      alert('Error al generar el reporte.');
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

        <section className="analysis-section" style={{ gridTemplateColumns: '1fr 1fr' }}>
          
          <div className="card summary-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
            <FileText size={48} style={{ color: 'var(--accent-primary)', marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px' }}>Cartera de Préstamos</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
              Descarga un listado completo de todos los préstamos registrados en el sistema, detallando el capital prestado y estado actual.
            </p>
            <button className="btn btn-primary" onClick={generateLoansReport} disabled={loadingLoans} style={{ width: '100%' }}>
              <Download size={18} style={{ marginRight: '10px' }} /> 
              {loadingLoans ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>

          <div className="card summary-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
            <FileText size={48} style={{ color: 'var(--accent-success)', marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px' }}>Transacciones Generales</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
              Extrae un listado histórico de todos los ingresos de capital, pagos recibidos, y egresos manuales del sistema.
            </p>
            <button className="btn btn-primary" onClick={generateTransactionsReport} disabled={loadingTrans} style={{ width: '100%', backgroundColor: 'var(--accent-success)' }}>
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
