import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

async function testPdf() {
    try {
        const loginRes = await axios.post('https://app-finanzasycobros-rust.vercel.app/api/auth/login', {
            email: 'admin@finanzas.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        
        const res = await axios.get('https://app-finanzasycobros-rust.vercel.app/api/loans', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Reporte de Préstamos Activos', 14, 22);
        
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

        console.log('PDF generado exitosamente (en memoria).');
    } catch (e) {
        console.error('Error generando PDF:', e);
    }
}

testPdf();
