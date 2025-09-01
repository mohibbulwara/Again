
'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { User, Dish, Order } from '@/types';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const generatePdf = (title: string, head: any[], body: any[], filename: string) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    doc.setFontSize(18);
    doc.text(title, 14, 22);

    autoTable(doc, {
        head,
        body,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [34, 34, 34], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' }, // Increased font size and padding
        columnStyles: { // Explicitly set minCellWidth for better control
            0: { minCellWidth: 20 }, // Order ID
            1: { minCellWidth: 25 }, // Date
            2: { minCellWidth: 25 }, // Buyer ID
            3: { minCellWidth: 30 }, // Seller ID(s)
            4: { minCellWidth: 30 }, // Seller Name(s)
            5: { minCellWidth: 20 }, // Total (BDT)
            6: { minCellWidth: 20 }, // Status
        },
        didParseCell: (data) => {
            // Center align headers
            if (data.section === 'head') {
                data.cell.styles.halign = 'center';
            }
        },
      });
      
    
    // Add footer with page number
    const pageCount = (doc.internal as any).getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// ---- User Export ----
export const exportUsersToPDF = (users: User[]) => {
    const tableHead = [['Name', 'Email', 'Role', 'Status', 'Joined']];
    const tableBody = users.map(user => [
        user.name,
        user.email,
        user.role,
        user.isSuspended ? 'Suspended' : 'Active',
        user.createdAt ? format(new Date(user.createdAt as string), 'PP') : 'N/A'
    ]);

    generatePdf('User List', tableHead, tableBody, 'aharian_users');
};


// ---- Dish Export ----
export const exportDishesToPDF = (dishes: Dish[]) => {
    const tableHead = [['Name', 'Category', 'Price (BDT)', 'Seller ID']];
    const tableBody = dishes.map(dish => [
        dish.name,
        dish.category,
        dish.price.toFixed(2),
        dish.sellerId
    ]);

    generatePdf('Dish List', tableHead, tableBody, 'aharian_dishes');
}

// ---- Order Export ----
export const exportOrdersToPDF = (orders: Order[], sellerNames: { [key: string]: string }, titleSuffix: string = 'All Orders') => {
    const tableHead = [['Order ID', 'Date', 'Buyer ID', 'Seller ID(s)', 'Seller Name(s)', 'Total (BDT)', 'Status']];
    const tableBody = orders.map(order => {
        const sellerIds = order.sellerIds.map(id => id || 'N/A').join('\n'); // Ensure full IDs for sellers
        const sellerNamesList = order.sellerIds.map(id => sellerNames[id] || 'Unknown Seller').join('\n'); // Change to 'Unknown Seller'
        return [
            order.id || 'N/A', // Display full Order ID
            order.createdAt ? format(new Date(order.createdAt as string), 'PP') : 'N/A',
            order.buyerId || 'N/A', // Display full Buyer ID
            sellerIds,
            sellerNamesList,
            order.total.toFixed(2),
            order.status,
        ];
    });

    generatePdf(`Order List - ${titleSuffix}`, tableHead, tableBody, 'aharian_orders');
};
