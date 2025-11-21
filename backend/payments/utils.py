import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from django.utils import timezone

def generate_payment_receipt(payment):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    # Title
    title_style = styles['Heading1']
    title_style.alignment = 1  # Center
    elements.append(Paragraph("Comprobante de Pago - MIRAMAX", title_style))
    elements.append(Spacer(1, 20))

    # Client Info
    client_info = [
        ["Cliente:", f"{payment.client.name} ({payment.client.code})"],
        ["DNI:", payment.client.dni],
        ["Dirección:", payment.client.address],
        ["Zona:", payment.client.caserio.name if payment.client.caserio else "-"],
    ]
    
    t_client = Table(client_info, colWidths=[100, 300])
    t_client.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
    ]))
    elements.append(t_client)
    elements.append(Spacer(1, 20))

    # Payment Details
    data = [
        ["Fecha:", payment.date.strftime("%d/%m/%Y")],
        ["Monto:", f"S/ {payment.amount}"],
        ["Método:", payment.get_method_display()],
        ["Referencia:", payment.reference_number or "-"],
        ["Servicio:", payment.monthly_fee.service.service_type.upper() if payment.monthly_fee else "Pago General"],
        ["Mes Pagado:", payment.monthly_fee.month.strftime("%B %Y") if payment.monthly_fee else "-"],
    ]

    t = Table(data, colWidths=[100, 300])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 30))

    # Footer
    footer_text = f"Generado el: {timezone.now().strftime('%d/%m/%Y %H:%M:%S')}"
    elements.append(Paragraph(footer_text, styles['Normal']))

    doc.build(elements)
    buffer.seek(0)
    return buffer
