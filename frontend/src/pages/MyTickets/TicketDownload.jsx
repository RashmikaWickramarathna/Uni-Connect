import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

import { humanizeTicketType } from "../../utils/ticketUtils";

export default function TicketDownload({ ticket, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!ticket) return undefined;

    let generatedUrl = null;

    QRCode.toCanvas(canvasRef.current, ticket.ticketNumber, {
      width: 120,
      margin: 1,
      color: { dark: "#1e293b", light: "#ffffff" },
    });

    const generatePDF = async () => {
      const canvas = canvasRef.current;
      const pdf = new jsPDF("p", "mm", "a4");
      const ticketName = ticket.ticketLabel || humanizeTicketType(ticket.ticketType);

      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("UniConnect Event Ticket", 105, 30, { align: "center" });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 85, 35, 30, 30);

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Ticket Number:", 20, 80);
      pdf.text(ticket.ticketNumber, 20, 90);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Event: ${ticket.eventTitle}`, 20, 105);
      pdf.text(`Date: ${new Date(ticket.eventDate).toLocaleDateString("en-LK")}`, 20, 115);
      pdf.text(`Venue: ${ticket.venue}`, 20, 125);
      pdf.text(`Type: ${ticketName}`, 20, 135);

      pdf.line(20, 145, 190, 145);
      pdf.text("Student Details:", 20, 155);
      pdf.text(`Name: ${ticket.studentName}`, 20, 165);
      pdf.text(`ID: ${ticket.studentId}`, 20, 175);
      pdf.text(`Email: ${ticket.email}`, 20, 185);

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(ticket.status === "confirmed" ? 34 : ticket.status === "cancelled" ? 220 : 202, 202, 202);
      pdf.text(String(ticket.status || "").toUpperCase(), 105, 210, { align: "center" });

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      generatedUrl = url;
      setPdfUrl(url);
    };

    generatePDF();

    return () => {
      if (generatedUrl) {
        URL.revokeObjectURL(generatedUrl);
      }
    };
  }, [ticket]);

  const handleDownload = () => {
    if (!pdfUrl || !ticket) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `UniConnect-Ticket-${ticket.ticketNumber}.pdf`;
    link.click();
  };

  if (!ticket) return null;

  return (
    <div className="ticket-download-modal">
      <div className="ticket-download-content">
        <div className="td-header">
          <h3>Download Ticket</h3>
          <button className="td-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="td-preview">
          <canvas ref={canvasRef} />
          <div className="td-ticket-number">{ticket.ticketNumber}</div>
        </div>
        <button className="td-download-btn" onClick={handleDownload}>
          Download PDF Ticket
        </button>
        <p className="td-note">Show the QR code at the event entrance.</p>
      </div>
    </div>
  );
}
