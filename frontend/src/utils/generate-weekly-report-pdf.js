// frontend/src/utils/generate-weekly-report-pdf.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Genera y descarga el reporte PDF de movimientos semanales adaptado a la identidad de Peak Investments.
 * @param {Object} options
 * @param {Array} options.transactions - Lista de transacciones
 * @param {Object} options.portfolio - Datos del portfolio
 * @param {Object} options.user - Datos del usuario logueado
 */
export const generateWeeklyReportPDF = ({ transactions = [], portfolio = null, user = null }) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Rango de fechas: últimos 7 días
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  // Filtrado de transacciones
  const weeklyTransactions = (transactions || []).filter((tx) => {
    const txDate = new Date(tx.timestamp || tx.date);
    return !isNaN(txDate.getTime()) && txDate >= sevenDaysAgo && txDate <= today;
  }).sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));

  const tieneMovimientos = weeklyTransactions.length > 0;

  // Datos del titular y cuenta
  const titular = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user?.username) || "Inversor";
  const numCuenta = user?.account_number || `CC N° ${String(user?.id || 1).padStart(5, "0")}`;
  const email = user?.email || "usuario@peakinvestments.ar";
  const dni = user?.dni ? `DNI: ${user.dni}` : "";
  const fechaStr = today.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Paleta de colores Peak Investments
  const primaryColor = [21, 101, 192];     // Azul institucional broker #1565c0
  const headerColor = [11, 14, 17];        // Fondo oscuro elegante #0b0e11
  const accentGreen = [76, 175, 80];       // Verde Peak #4caf50
  const textDark = [15, 23, 42];           // Texto principal
  const textMuted = [100, 116, 139];       // Texto secundario gris

  // ================= 1. CABECERA INSTITUCIONAL PEAK INVESTMENTS =================
  // Ícono estilizado de pico / crecimiento ascendente
  doc.setFillColor(...accentGreen);
  doc.triangle(14, 22, 19, 13, 24, 22, "F");
  doc.setFillColor(33, 150, 243);
  doc.triangle(20, 22, 24, 15, 28, 22, "F");

  // Marca Peak Investments
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...textDark);
  doc.text("PEAK", 31, 17);
  doc.setTextColor(...accentGreen);
  doc.text("INVESTMENTS", 48, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text("Plataforma Financiera & Agente de Liquidación y Compensación", 31, 21.5);

  // Título "ESTADO DE CUENTA" a la derecha
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...textDark);
  doc.text("ESTADO DE CUENTA", pageWidth - 14, 16, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(`Cuenta ${numCuenta.replace("CC N° ", "")} - ${fechaStr}`, pageWidth - 14, 21.5, { align: "right" });

  // Metadatos de la cuenta
  let curY = 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text("N° CUENTA", 14, curY);
  doc.text("FECHA DE EMISIÓN", 75, curY);
  doc.text("ASESOR / PLATAFORMA", pageWidth - 14, curY, { align: "right" });

  curY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  doc.text(numCuenta, 14, curY);
  doc.text(fechaStr, 75, curY);
  doc.text("Peak Investments Broker", pageWidth - 14, curY, { align: "right" });

  curY += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text("TITULAR", 14, curY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text(email, pageWidth - 14, curY, { align: "right" });

  curY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  doc.text(`${titular} ${dni ? `(${dni})` : ""}`, 14, curY);

  // Línea sutil divisoria
  curY += 4.5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, curY, pageWidth - 14, curY);

  // ================= 2. BANNER DE MOVIMIENTOS SEMANALES =================
  curY += 5.5;
  doc.setFillColor(...primaryColor);
  doc.rect(14, curY, pageWidth - 28, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("MOVIMIENTOS DE LA SEMANA (ÚLTIMOS 7 DÍAS)", 18, curY + 4.8);

  curY += 11;

  // ================= 3. TABLA O ESTADO SIN MOVIMIENTOS =================
  if (!tieneMovimientos) {
    // Cuadro estilizado "Sin movimientos"
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, curY, pageWidth - 28, 28, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(100, 116, 139);
    doc.text("Sin movimientos", pageWidth / 2, curY + 13, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `No se registraron operaciones de compra, venta, depósitos ni extracciones entre el ${sevenDaysAgo.toLocaleDateString("es-AR")} y el ${today.toLocaleDateString("es-AR")}.`,
      pageWidth / 2,
      curY + 20,
      { align: "center" }
    );

    curY += 36;
  } else {
    // Mapeo amigable de tipos de orden
    const formatType = (rawType) => {
      const t = (rawType || "").toUpperCase();
      if (t === "BUY" || t === "COMPRA") return "Compra";
      if (t === "SELL" || t === "VENTA") return "Venta";
      if (t === "DEP" || t === "DEPOSIT" || t === "DEPÓSITO") return "Depósito";
      if (t === "WIT" || t === "WITHDRAW" || t === "RETIRO") return "Extracción";
      return rawType || "Operación";
    };

    const tableRows = weeklyTransactions.map((tx) => {
      const d = new Date(tx.timestamp || tx.date);
      const fechaFmt = !isNaN(d.getTime())
        ? d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
        : "-";
      const tipo = formatType(tx.transaction_type);
      const especie = tx.symbol || "-";
      const cant = tx.symbol === "CASH" ? "-" : parseFloat(tx.quantity || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
      const precio = parseFloat(tx.price || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const montoTotal = parseFloat(tx.total_price || (tx.quantity * tx.price) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      return [fechaFmt, especie, tipo, cant, `$ ${precio}`, `$ ${montoTotal}`];
    });

    autoTable(doc, {
      startY: curY,
      head: [["FECHA", "ESPECIE", "OPERACIÓN", "CANTIDAD", "PRECIO", "TOTAL (USD)"]],
      body: tableRows,
      theme: "plain",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: "bold",
        fontSize: 8,
        halign: "left",
      },
      styles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 2.6,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 26, fontStyle: "bold" },
        2: { cellWidth: 30 },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 32, halign: "right" },
        5: { halign: "right", fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
    });

    curY = doc.lastAutoTable.finalY + 8;
  }

  // ================= 4. RESUMEN DE DISPONIBILIDADES =================
  if (curY > pageHeight - 70) {
    doc.addPage();
    curY = 20;
  }

  doc.setFillColor(...primaryColor);
  doc.rect(14, curY, pageWidth - 28, 6.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("RESUMEN DE DISPONIBILIDADES Y SALDOS", 18, curY + 4.5);

  curY += 10;

  const cashVal = parseFloat(portfolio?.cash ?? 5000.0).toLocaleString("es-AR", { minimumFractionDigits: 2 });
  const stocksVal = (portfolio?.positions || []).reduce((acc, p) => acc + (parseFloat(p.quantity || 0) * parseFloat(p.average_price || 0)), 0);
  const totalVal = (parseFloat(portfolio?.cash ?? 5000.0) + stocksVal).toLocaleString("es-AR", { minimumFractionDigits: 2 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text("Efectivo disponible (CASH):", 18, curY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(`$ ${cashVal} USD`, 80, curY);

  curY += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text("Patrimonio total valorizado estimado:", 18, curY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(`$ ${totalVal} USD`, 80, curY);

  // ================= 5. FOOTER & DISCLAIMER =================
  const disclaimerY = pageHeight - 26;
  doc.setFillColor(...primaryColor);
  doc.rect(14, disclaimerY, pageWidth - 28, 4.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("AVISO LEGAL / DISCLAIMER", 18, disclaimerY + 3.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...textMuted);
  const disclaimerText =
    "Peak Investments S.A. - Este reporte refleja los movimientos y saldos informados en el sistema al momento de su emisión. Las cotizaciones expresadas corresponden a los últimos valores de mercado registrados. Los rendimientos pasados no aseguran resultados futuros. Documento confidencial para uso exclusivo del titular.";
  doc.text(doc.splitTextToSize(disclaimerText, pageWidth - 28), 14, disclaimerY + 7.5);

  // Nombre de archivo descargado
  const filename = `PeakInvestments_Movimientos_${numCuenta.replace(/\s+/g, "_")}_${today.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
