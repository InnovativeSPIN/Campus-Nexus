import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const downloadLeaveReport = (leaveData: any) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Leave Application Report', 14, 22);

  // Subtitle / Date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Leave Details Table
  autoTable(doc, {
    startY: 40,
    theme: 'grid',
    headStyles: { fillColor: [65, 105, 225] },
    body: [
      ['Applicant ID', leaveData.applicantId || 'N/A'],
      ['Applicant Name', leaveData.applicantName || leaveData.applicant?.name || 'N/A'],
      ['Leave Type', leaveData.leaveType || 'N/A'],
      ['Status', leaveData.status || 'N/A'],
      ['Start Date', new Date(leaveData.startDate).toLocaleDateString()],
      ['End Date', new Date(leaveData.endDate).toLocaleDateString()],
      ['Total Days', leaveData.totalDays?.toString() || 'N/A'],
      ['Reason', leaveData.reason || 'N/A'],
      ['Substitute/Reassign Faculty', leaveData.reassignFacultyName || leaveData.substituteFacultyName || leaveData.substituteFaculty?.Name || 'N/A'],
      ['Approver Remarks', leaveData.approvalRemarks || 'N/A'],
      ['Application Date', new Date(leaveData.createdAt).toLocaleDateString()],
    ],
    columns: [
      { header: 'Field', dataKey: 'field' },
      { header: 'Details', dataKey: 'value' }
    ],
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto' }
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`Leave_Report_${leaveData.applicantName || leaveData.applicantId || 'Employee'}_${leaveData.id || 'N/A'}.pdf`);
};
