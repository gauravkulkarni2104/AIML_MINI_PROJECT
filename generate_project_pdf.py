"""
Generate comprehensive project documentation PDF for:
MIT Academy of Engineering - AIML Mini Project
Smart Student Performance & Dropout Risk Prediction System
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

PDF_PATH = r"d:\AIML PROJECT\Project_Documentation_Report.pdf"

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (Pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 750, "MIT Academy of Engineering | Smart Student Performance & Dropout Risk Prediction System")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Footer (All pages)
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, footer_text)
        self.drawString(54, 36, "Confidential - Academic Project Documentation")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 46, 558, 46)

        self.restoreState()

def build_pdf():
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    c_navy = colors.HexColor("#0f172a")
    c_blue = colors.HexColor("#1d4ed8")
    c_dark = colors.HexColor("#334155")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_navy,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=c_blue,
        spaceAfter=15
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=c_navy,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_blue,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_dark,
        leftIndent=15,
        spaceAfter=3
    )

    th_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    td_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=c_dark
    )

    td_bold_style = ParagraphStyle(
        'TDBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=c_navy
    )

    story = []

    # ================= COVER / TITLE BLOCK =================
    story.append(Paragraph("MIT ACADEMY OF ENGINEERING", ParagraphStyle('Univ', fontName='Helvetica-Bold', fontSize=12, leading=14, textColor=c_blue)))
    story.append(Paragraph("DEPARTMENT OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING", ParagraphStyle('Dept', fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor("#64748b"), spaceAfter=15)))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_blue, spaceAfter=15))
    story.append(Paragraph("Smart Student Performance & Dropout Risk Prediction System", title_style))
    story.append(Paragraph("AIML Mini Project Documentation & Architectural Technical Report", subtitle_style))
    story.append(Paragraph("<b>Institution:</b> MIT Academy of Engineering, Pune | <b>Dataset:</b> UCI Machine Learning Repository | <b>Target:</b> Dropout, Enrolled, Graduate", meta_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=15))

    # ================= SECTION 1: PROBLEM STATEMENT & OBJECTIVES =================
    story.append(Paragraph("1. Problem Statement & Objectives", h1_style))
    story.append(Paragraph(
        "Educational institutions collect rich historical data spanning academic evaluations, entrance grades, demographic backgrounds, and socioeconomic indicators. "
        "However, analyzing these large-scale multidimensional records manually to identify students vulnerable to course failure or discontinuation is arduous and reactive. "
        "This project establishes an intelligent educational decision-support platform utilizing Machine Learning to predict student trajectories early, profile distinct student performance cohorts, and provide timely, personalized intervention recommendations.",
        body_style
    ))
    story.append(Paragraph("<b>Core Objectives:</b>", h2_style))
    story.append(Paragraph("• <b>Ingest & Preprocess:</b> Ingest 4,424 real-world student records across 36 features from the official UCI repository.", bullet_style))
    story.append(Paragraph("• <b>Analyze Trajectory Factors:</b> Identify primary academic and socioeconomic factors influencing academic completion.", bullet_style))
    story.append(Paragraph("• <b>Supervised Classification Models:</b> Develop and train Logistic Regression, Decision Tree, Random Forest, and K-Star (K*) classifiers on a stratified 80:20 partition.", bullet_style))
    story.append(Paragraph("• <b>Unsupervised Academic Clustering:</b> Segment student performance bands using K-Means clustering with 2D PCA spatial mapping.", bullet_style))
    story.append(Paragraph("• <b>Comparative Benchmark:</b> Evaluate all algorithms across Accuracy, Precision, Recall, F1-Score, and 3x3 Confusion Matrices.", bullet_style))
    story.append(Paragraph("• <b>Decision-Support Guidance:</b> Output Performance Level (Good / Average / At Risk), Dropout Risk (Low / High), and personalized action recommendations across Study, Attendance, and Coursework.", bullet_style))
    story.append(Spacer(1, 10))

    # ================= SECTION 2: DATASET OVERVIEW & EVERY FIELD EXPLAINED =================
    story.append(Paragraph("2. Dataset Details & Complete Field Specification", h1_style))
    story.append(Paragraph(
        "<b>Source:</b> UCI Machine Learning Repository (<i>Predict Students' Dropout and Academic Success</i>). "
        "Comprises <b>4,424 records</b>, <b>36 input attributes</b>, and <b>1 target outcome</b>: Dropout (1,421 / 32.1%), Enrolled (794 / 17.9%), and Graduate (2,209 / 49.9%).",
        body_style
    ))

    # Table of Features
    table_data = [
        [
            Paragraph("Category", th_style),
            Paragraph("Feature Name", th_style),
            Paragraph("Scale / Type", th_style),
            Paragraph("Description & Analytical Importance", th_style)
        ]
    ]

    features_info = [
        ("Academic", "Curricular units 1st sem (credited)", "Int (>=0)", "Number of 1st semester credits approved by previous diplomas/transfers."),
        ("Academic", "Curricular units 1st sem (enrolled)", "Int (>=0)", "Number of curricular units registered in the 1st semester."),
        ("Academic", "Curricular units 1st sem (evaluations)", "Int (>=0)", "Count of formal evaluation assessments attempted in 1st semester."),
        ("Academic", "Curricular units 1st sem (approved)", "Int (>=0)", "Critical predictor: Number of 1st sem courses successfully approved."),
        ("Academic", "Curricular units 1st sem (grade)", "Float (0-20)", "1st semester GPA on standard 0-20 scale (< 10.0 indicates failing)."),
        ("Academic", "Curricular units 1st sem (without eval)", "Int (>=0)", "Enrolled units where student skipped all exam assessments."),
        ("Academic", "Curricular units 2nd sem (credited)", "Int (>=0)", "Number of 2nd semester credits recognized via external credits."),
        ("Academic", "Curricular units 2nd sem (enrolled)", "Int (>=0)", "Number of curricular units registered in the 2nd semester."),
        ("Academic", "Curricular units 2nd sem (evaluations)", "Int (>=0)", "Count of formal assessments attempted in 2nd semester."),
        ("Academic", "Curricular units 2nd sem (approved)", "Int (>=0)", "Highest correlation to retention: Passing <= 2 units yields 82%+ dropout rate."),
        ("Academic", "Curricular units 2nd sem (grade)", "Float (0-20)", "2nd semester GPA on standard 0-20 scale."),
        ("Academic", "Curricular units 2nd sem (without eval)", "Int (>=0)", "2nd sem units where student did not attend any examination attempt."),
        ("Academic", "Admission grade", "Float (0-200)", "National entrance exam qualification score used for college admission."),
        ("Academic", "Previous qualification (grade)", "Float (0-200)", "Prior secondary school graduation grade average."),
        ("Academic", "Course", "Cat (1-17)", "Degree program code (Informatics, Nursing, Agronomy, Management, etc.)."),
        ("Demographic", "Age at enrollment", "Int (17-70)", "Chronological age at entry. Older non-traditional students show higher attrition."),
        ("Demographic", "Gender", "Bin (1=M, 0=F)", "Recorded biological sex. Female cohort exhibits higher completion rates."),
        ("Demographic", "Marital status", "Cat (1-6)", "1=Single, 2=Married, 3=Widower, 4=Divorced, 5=Facto Union, 6=Separated."),
        ("Demographic", "Nacionality", "Cat (1-21)", "Country of citizenship (Portuguese, Brazilian, Angolan, Spanish, etc.)."),
        ("Demographic", "International", "Bin (1=Y, 0=N)", "Indicates whether the student is studying under an international student visa."),
        ("Demographic", "Displaced", "Bin (1=Y, 0=N)", "Indicates whether the student relocated from home city to attend college."),
        ("Demographic", "Educational special needs", "Bin (1=Y, 0=N)", "Registered student learning or accessibility accommodation needs."),
        ("Socio-Econ", "Mother's qualification", "Cat (1-44)", "Highest educational degree completed by the student's mother."),
        ("Socio-Econ", "Father's qualification", "Cat (1-44)", "Highest educational degree completed by the student's father."),
        ("Socio-Econ", "Mother's occupation", "Cat (0-46)", "Occupational employment category of the mother."),
        ("Socio-Econ", "Father's occupation", "Cat (0-46)", "Occupational employment category of the father."),
        ("Socio-Econ", "Scholarship holder", "Bin (1=Y, 0=N)", "Active scholarship recipient. Strongly correlates with persistence."),
        ("Socio-Econ", "Debtor", "Bin (1=Y, 0=N)", "Whether the student has outstanding unpaid institutional debts."),
        ("Socio-Econ", "Tuition fees up to date", "Bin (1=Y, 0=N)", "Current on tuition payments. Non-payment (0) is a major dropout driver."),
        ("Admin/Macro", "Application mode", "Cat (1-18)", "Application channel (General contest, Over 23, Transfer, International)."),
        ("Admin/Macro", "Application order", "Int (0-9)", "Choice preference order of the program (1=1st choice, up to 9th choice)."),
        ("Admin/Macro", "Daytime/evening attendance", "Bin (1=Day, 0=Eve)", "Class attendance shift. Evening students juggle employment and have higher risk."),
        ("Admin/Macro", "Previous qualification", "Cat (1-17)", "Type of qualification attained before higher education enrollment."),
        ("Admin/Macro", "Unemployment rate", "Float (%)", "Regional economic unemployment percentage during the enrolled semester."),
        ("Admin/Macro", "Inflation rate", "Float (%)", "National economic inflation rate percentage."),
        ("Admin/Macro", "GDP", "Float (%)", "Gross Domestic Product percentage change during the academic year."),
        ("Target", "Target", "Nominal", "Outcome status: Dropout (32.1%), Enrolled (17.9%), or Graduate (49.9%).")
    ]

    for cat, name, scale, desc in features_info:
        table_data.append([
            Paragraph(cat, td_bold_style),
            Paragraph(name, td_bold_style),
            Paragraph(scale, td_style),
            Paragraph(desc, td_style)
        ])

    feat_table = Table(table_data, colWidths=[1.0*inch, 2.2*inch, 0.9*inch, 2.9*inch])
    feat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_navy),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))

    story.append(feat_table)
    story.append(Spacer(1, 15))

    # ================= SECTION 3: SYSTEM ARCHITECTURE & METHODOLOGY =================
    story.append(PageBreak())
    story.append(Paragraph("3. System Architecture & Machine Learning Pipeline", h1_style))
    story.append(Paragraph(
        "The application is engineered according to a modular educational analytics architecture separating dataset operations, unsupervised clustering, multi-classifier training, inference, and recommendation generation.",
        body_style
    ))

    arch_steps = [
        ("Step 1: Ingestion & Validation", "CSV/XLSX uploaded or loaded from dataset/data.csv, verified against 36 canonical feature schemas."),
        ("Step 2: Preprocessing & Scaling", "Continuous academic inputs normalized with StandardScaler; categorical nominal attributes encoded appropriately."),
        ("Step 3: Unsupervised Segmentation", "K-Means (k=2 to 6) clusters students on academic metrics; PCA projects vectors onto a 2D plane."),
        ("Step 4: Supervised Classification", "Stratified 80:20 train/test split. Trains Logistic Regression, Decision Tree, Random Forest, and Weka K-Star."),
        ("Step 5: Decision Support & Advice", "Computes Academic Performance (Good/Average/At Risk), Dropout Risk (Low/High), and tailored action plans.")
    ]

    arch_data = [
        [Paragraph("Pipeline Stage", th_style), Paragraph("Implementation Details & Core Algorithms", th_style)]
    ]
    for stage, detail in arch_steps:
        arch_data.append([Paragraph(stage, td_bold_style), Paragraph(detail, td_style)])

    arch_table = Table(arch_data, colWidths=[2.2*inch, 4.8*inch])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_navy),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 15))

    # ================= SECTION 4: MACHINE LEARNING MODELS & EVALUATION =================
    story.append(Paragraph("4. Machine Learning Algorithms & Model Comparison", h1_style))
    story.append(Paragraph(
        "All models were evaluated on the exact same <b>unseen test cohort of 885 students</b> (stratified 20% holdout split) to ensure unbiased, rigorous comparison.",
        body_style
    ))

    comp_headers = [
        Paragraph("Algorithm", th_style),
        Paragraph("Model Type", th_style),
        Paragraph("Accuracy", th_style),
        Paragraph("Precision", th_style),
        Paragraph("Recall", th_style),
        Paragraph("F1-Score", th_style),
        Paragraph("Evaluation Status", th_style)
    ]

    comp_rows = [
        comp_headers,
        [Paragraph("Random Forest", td_bold_style), Paragraph("Ensemble (100 Trees)", td_style), Paragraph("76.72%", td_bold_style), Paragraph("68.79%", td_style), Paragraph("69.57%", td_style), Paragraph("69.16%", td_bold_style), Paragraph("Recommended (Top Generalization)", td_style)],
        [Paragraph("Logistic Regression", td_bold_style), Paragraph("L2 Penalized Linear", td_style), Paragraph("76.84%", td_bold_style), Paragraph("67.75%", td_style), Paragraph("68.86%", td_style), Paragraph("68.26%", td_bold_style), Paragraph("Active Baseline", td_style)],
        [Paragraph("Decision Tree", td_bold_style), Paragraph("CART (Depth 6)", td_style), Paragraph("73.22%", td_bold_style), Paragraph("65.25%", td_style), Paragraph("65.36%", td_style), Paragraph("65.30%", td_bold_style), Paragraph("Active Pruned Tree", td_style)],
        [Paragraph("K-Star (K*)", td_bold_style), Paragraph("Entropy-Distance Lazy", td_style), Paragraph("65.20%", td_bold_style), Paragraph("59.27%", td_style), Paragraph("56.33%", td_style), Paragraph("56.97%", td_bold_style), Paragraph("Weka Java Execution Engine", td_style)],
        [Paragraph("K-Means (Unsupervised)", td_bold_style), Paragraph("Centroid Clustering", td_style), Paragraph("Silhouette: 0.435", td_bold_style), Paragraph("Inertia: 14,821", td_style), Paragraph("k=3 Clusters", td_style), Paragraph("PCA 2D Mapping", td_style), Paragraph("Academic Cohort Segmentation", td_style)]
    ]

    comp_table = Table(comp_rows, colWidths=[1.4*inch, 1.4*inch, 0.8*inch, 0.7*inch, 0.7*inch, 0.7*inch, 1.3*inch])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_navy),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 15))

    # Confusion Matrix Section
    story.append(Paragraph("<b>Test Confusion Matrix Comparison (885 Unseen Test Students):</b>", h2_style))

    cm_data = [
        [
            Paragraph("True \\ Pred", th_style),
            Paragraph("Random Forest (Acc: 76.7%)<br/>[Drop / Enr / Grad]", th_style),
            Paragraph("Logistic Regression (Acc: 76.8%)<br/>[Drop / Enr / Grad]", th_style),
            Paragraph("Weka K-Star (Acc: 65.2%)<br/>[Drop / Enr / Grad]", th_style)
        ],
        [
            Paragraph("<b>Dropout (284)</b>", td_bold_style),
            Paragraph("<b>222</b> / 22 / 40 (78.2% Recall)", td_style),
            Paragraph("<b>215</b> / 27 / 42 (75.7% Recall)", td_style),
            Paragraph("<b>149</b> / 46 / 89 (52.5% Recall)", td_style)
        ],
        [
            Paragraph("<b>Enrolled (159)</b>", td_bold_style),
            Paragraph("49 / <b>53</b> / 57 (33.3% Recall)", td_style),
            Paragraph("44 / <b>54</b> / 61 (34.0% Recall)", td_style),
            Paragraph("36 / <b>49</b> / 74 (30.8% Recall)", td_style)
        ],
        [
            Paragraph("<b>Graduate (442)</b>", td_bold_style),
            Paragraph("19 / 19 / <b>404</b> (91.4% Recall)", td_style),
            Paragraph("17 / 14 / <b>411</b> (93.0% Recall)", td_style),
            Paragraph("23 / 40 / <b>379</b> (85.7% Recall)", td_style)
        ]
    ]

    cm_table = Table(cm_data, colWidths=[1.5*inch, 1.8*inch, 1.8*inch, 1.9*inch])
    cm_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_navy),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(cm_table)
    story.append(Spacer(1, 15))

    # ================= SECTION 5: RECOMMENDATION MODULE & PREDICTION SYSTEM =================
    story.append(PageBreak())
    story.append(Paragraph("5. Prediction System & Recommendation Module", h1_style))
    story.append(Paragraph(
        "In compliance with project specifications, the system delivers dual indicators alongside the predicted outcome and exact class probabilities:",
        body_style
    ))
    story.append(Paragraph("• <b>Academic Performance Level:</b> Categorized as <b>Good</b> (steady GPA and >=5 credits passed), <b>Average</b>, or <b>At Risk</b> (<=2 credits approved or failing grades).", bullet_style))
    story.append(Paragraph("• <b>Dropout Risk:</b> Categorized as <b>Low Risk</b> or <b>High Risk</b>.", bullet_style))
    story.append(Paragraph("• <b>Class Probabilities:</b> Continuous percentage distribution over Dropout %, Enrolled %, and Graduate %.", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Personalized Recommendation Module:</b>", h2_style))
    story.append(Paragraph(
        "Based on identified student risk factors (e.g. tuition arrears, missed evaluations, low credit approvals), the system automatically compiles actionable recommendations across three distinct dimensions:",
        body_style
    ))

    rec_data = [
        [Paragraph("Category", th_style), Paragraph("Triggering Factor", th_style), Paragraph("Recommended Academic Intervention", th_style)],
        [Paragraph("Study Guidance", td_bold_style), Paragraph("Approved Units <= 2 or Semester GPA < 10.0", td_style), Paragraph("Enroll in foundational remedial tutoring modules; adjust per-semester credit pacing to prevent overload.", td_style)],
        [Paragraph("Attendance & Exam", td_bold_style), Paragraph("Enrolled units > Evaluated units", td_style), Paragraph("Enforce 100% exam/assessment participation; review class attendance records to avoid de-registration.", td_style)],
        [Paragraph("Administrative & Support", td_bold_style), Paragraph("Tuition unpaid (0) or Debtor (1)", td_style), Paragraph("Connect with Student Financial Welfare for emergency installment plans; schedule mandatory faculty advisor checkpoint.", td_style)]
    ]

    rec_table = Table(rec_data, colWidths=[1.5*inch, 2.0*inch, 3.5*inch])
    rec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_navy),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(rec_table)
    story.append(Spacer(1, 15))

    # ================= SECTION 6: TECHNOLOGY STACK & HOW TO RUN =================
    story.append(Paragraph("6. Technology Stack & Execution Guide", h1_style))

    tech_data = [
        [Paragraph("Layer", th_style), Paragraph("Technologies Used", th_style), Paragraph("Role in System", th_style)],
        [Paragraph("Frontend UI", td_bold_style), Paragraph("React 18, Vite 5, Tailwind CSS, Recharts, Lucide Icons", td_style), Paragraph("Responsive academic dashboard, interactive scatter charts, confusion matrix inspector, prediction forms.", td_style)],
        [Paragraph("Backend REST API", td_bold_style), Paragraph("Python 3.13, Flask, Flask-CORS", td_style), Paragraph("RESTful endpoints for data ingestion, model inference, clustering, and health monitoring.", td_style)],
        [Paragraph("Machine Learning", td_bold_style), Paragraph("Scikit-learn, NumPy, Pandas, Joblib", td_style), Paragraph("Data preprocessing, Random Forest, Logistic Regression, Decision Tree, and K-Means clustering.", td_style)],
        [Paragraph("Java Integration", td_bold_style), Paragraph("Embedded OpenJDK 17 + Weka ML Library (weka.jar)", td_style), Paragraph("Executes genuine K-Star instance-based classification via subprocess without external dependencies.", td_style)]
    ]

    tech_table = Table(tech_data, colWidths=[1.2*inch, 2.6*inch, 3.2*inch])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_navy),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>How to Run the Application:</b>", h2_style))
    story.append(Paragraph("<b>Terminal 1 — Backend API:</b> <code>cd 'd:\\AIML PROJECT'</code> then <code>python backend/app.py</code> (Runs at <code>http://localhost:5000</code>).", bullet_style))
    story.append(Paragraph("<b>Terminal 2 — Frontend UI:</b> <code>cd 'd:\\AIML PROJECT'</code> then <code>npm run dev</code> (Runs at <code>http://localhost:5173</code>).", bullet_style))
    story.append(Spacer(1, 15))

    # ================= SECTION 7: CONCLUSION & SUMMARY =================
    story.append(Paragraph("7. Conclusion", h1_style))
    story.append(Paragraph(
        "The Smart Student Performance & Dropout Risk Prediction System provides a robust, educational decision-support framework. "
        "By synthesizing unsupervised clustering (K-Means) with four distinct supervised classifiers (Random Forest, Logistic Regression, Decision Tree, K-Star), "
        "the system achieves over 76.8% accuracy on unseen student data while offering actionable, empathetic recommendations to preserve academic retention.",
        body_style
    ))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.0, color=c_blue, spaceAfter=8))
    story.append(Paragraph("<b>MIT Academy of Engineering</b> | Department of Artificial Intelligence & Machine Learning", ParagraphStyle('FooterEnd', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=c_navy, alignment=1)))

    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF successfully generated at:", PDF_PATH)

if __name__ == "__main__":
    build_pdf()
