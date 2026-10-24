"""Build data/background.json: how each programme treats an MBA, the IIT Madras BS in Data Science, SAP experience and
about 2 years of work experience, plus career outcomes and campus career network.

Every flag has ev = 'documented' (stated on an official page I read) or 'inferred' (my reading of the programme's audience or prerequisites).
Run from the repo root:  python3 tools/build_background.py
"""
import json, collections
P = json.load(open("data/programs.json"))["programs"]
byid = {p["id"]: p for p in P}
ALL = [p["id"] for p in P]

def ids(s): return s.split()

# ---------------------------------------------------------------- work experience (user: about 2 years)
WORKEX = {}
def wx(s, l, n, ev="documented"):
    for i in ids(s): WORKEX[i] = {"l": l, "n": n, "ev": ev}
wx("p1", "strong", "Employment and first work experience are admission requirements. Participants come from IT, consulting, automotive and finance.")
wx("p72", "strong", "About 2 years of business or technology experience is preferred (SMU).")
wx("p29", "strong", "Prefers at least one year of relevant experience (IE).")
wx("p80 p32", "strong", "Online and part-time, so you can keep working while you study.", "inferred")
wx("p20", "ok", "Queen's runs part-time and online versions for working professionals alongside a full-time one: check which you apply to.")
wx("p14", "ok", "Work experience is desired but not mandatory.")
wx("p61", "ok", "Post-degree work experience is recommended, not required.")
wx("p90", "ok", "Work experience is desirable; an unrelated degree can be considered with relevant experience.")
wx("p12", "ok", "No minimum experience; list relevant experience on your CV.")
wx("p9", "ok", "Work experience is optional; recent graduates can apply.")
wx("p42", "ok", "Two years of relevant experience can replace the degree requirement.")
wx("p41", "ok", "A related bachelor's plus 2 years of experience qualifies you for the shorter entry level.")
wx("p63", "ok", "Relevant experience can shorten the course to 1.5 years.")
wx("p10", "ok", "A 2.2 degree plus 2 years of relevant work is considered.")
wx("p5", "ok", "Experience can substitute for a degree grade, but the stated route is 3 years.")
wx("p65", "ok", "Relevant experience is accepted in place of the degree grade only in exceptional cases.")
wx("p35", "ok", "Aimed at candidates with under 3 years of experience: 2 years fits, but an MBA on top may take you over.")
wx("p55", "risk", "Allows no more than 2 years of postgraduate experience. An MBA plus 2 years of work would probably exceed it.")
wx("p53", "none", "Work experience cannot make up for missing CS subjects.")
for i in ALL: WORKEX.setdefault(i, {"l": "none", "n": "Experience is not part of the selection we found.", "ev": "documented"})

# ---------------------------------------------------------------- MBA
MBA = {}
def mb(s, l, n, ev="inferred"):
    for i in ids(s): MBA[i] = {"l": l, "n": n, "ev": ev}
mb("p1", "strong", "A part-time programme for working professionals: an MBA and management background fits the cohort.")
mb("p20 p80 p32 p72", "ok", "Suits experienced professionals; an MBA is welcome but not specifically rewarded.")
mb("p55", "risk", "A pre-experience Master in Management: it requires a business bachelor's and caps experience at 2 years.", "documented")
mb("p35", "risk", "A pre-experience programme (under 3 years of experience): an MBA holder may be over-qualified.", "documented")
mb("p26 p2 p7", "risk", "A Master in Management aimed at bachelor's graduates and young professionals: an MBA may duplicate it.")
BIZ = "p9 p12 p13 p14 p15 p16 p18 p19 p21 p22 p23 p24 p25 p27 p28 p29 p30 p33 p34 p36 p37 p38 p39 p41 p42 p43 p44 p47 p48 p49 p56 p61 p63 p64 p65 p76 p78 p90 p95 p8 p5 p10 p46 p71 p4 p11 p6 p77 p59 p31 p17 p82".split()
for i in BIZ:
    if i not in MBA: MBA[i] = {"l": "ok", "n": "Open to graduates with a business background. Admission does not give extra credit for an MBA.", "ev": "inferred"}
for i in ALL:
    if i not in MBA: MBA[i] = {"l": "none", "n": "A technical programme: selection is on maths and CS credits, so an MBA adds little.", "ev": "inferred"}

# ---------------------------------------------------------------- IIT Madras BS in Data Science and Applications
CS_HEAVY = "p3 p51 p52 p53 p54 p57 p58 p60 p62 p66 p67 p68 p69 p70 p74 p80 p81 p88 p89 p92 p94 p96 p97 p98 p99 p100 p31 p59 p87 p91 p93 p73 p79 p32 p45 p75 p77 p83 p84 p85 p86".split()
BIZ_CREDITS = "p2 p6 p11 p55 p26 p16 p19 p49 p12 p18".split()
IITM = {}
APS = "APS India verifies online or distance degrees only if the Distance Education Bureau recognised them for the whole course: confirm with APS India before you apply."
for p in P:
    i = p["id"]; c = p["country"]
    if i in CS_HEAVY: base = ("strong", "Matches the maths, statistics, programming and ML prerequisites. The BS is a 4-year, 142-credit IIT degree.")
    elif i in BIZ_CREDITS: base = ("risk", "Asks for business credits (ECONOMICS or business ECTS) that the IITM BS does not carry.")
    else: base = ("ok", "Accepts any relevant bachelor's. A quantitative degree helps; ask whether an online-mode degree is accepted.")
    lvl, note = base
    if c == "Germany":
        lvl = "risk" if lvl == "risk" else "ask"; note += " " + APS
        ev = "documented"
    else: ev = "inferred"
    if c == "Canada" and lvl != "risk": note += " Canadian masters expect a 4-year degree: the BS qualifies on length."
    if i == "p60": note = "Needs a 4-year degree from a NAAC/AICTE or Institute-of-National-Importance university with CGPA 8.5: IIT Madras qualifies on type, but the CGPA bar is high, and the eight prerequisite subject areas match the BS courses."
    if i == "p57": note = "Needs a 4-year degree with 65% and maths modules at 60%: the BS fits on length and maths content."
    IITM[i] = {"l": lvl, "n": note, "ev": ev}

# ---------------------------------------------------------------- SAP
SAP = {}
def sp(s, l, n, ev):
    for i in ids(s): SAP[i] = {"l": l, "n": n, "ev": ev}
sp("p7 p53", "strong", "TUM runs an SAP University Competence Center, and SAP is the first partner of the TUM Industry Engagement Program.", "documented")
sp("p89", "strong", "Münster's information systems department offers SAP-certified ERP courses (TERP10) through SAP University Alliances. Dates I found were older: check the current schedule.", "documented")
sp("p19", "strong", "WU's IS & Processes specialisation includes a course on integrating business processes in SAP ERP.", "documented")
sp("p75", "strong", "UT Dallas teaches SAP S/4HANA courses and offers an SAP University Alliances certificate.", "documented")
sp("p47", "strong", "NTU's MSc includes a module on the SAP ERP system and an SAP elective.", "documented")
sp("p4", "ok", "TUM's SAP partnership is university-wide. I could not confirm SAP content in the Heilbronn programme.", "documented")
sp("p1 p2 p3 p54", "ok", "Mannheim sits in SAP's home region (Rhine-Neckar). It runs a joint SAP PhD programme, and Business Informatics lists SAP among graduate employers.", "documented")
sp("p13", "ok", "UCD joined SAP University Alliances in 2009 and integrated SAP applications into Smurfit programmes: check what is current.", "documented")
sp("p42", "ok", "NUS partnered with SAP on a cloud HANA system for its MSBA (older announcement).", "documented")
sp("p16 p51 p31 p59 p77 p21 p18 p87", "ok", "An information-systems or business-informatics programme where ERP is a typical topic. I found no SAP partnership.", "inferred")
for i in ALL:
    if i not in SAP: SAP[i] = {"l": "none", "n": "No SAP link found.", "ev": "documented"}

# ---------------------------------------------------------------- career outcomes and campus network
CAREER = {}
def cr(s, l, stat, note, url):
    for i in ids(s): CAREER[i] = {"l": l, "s": stat, "n": note, "u": url}
cr("p7", "strong", "84% to 89% employed within 3 to 6 months; average starting salary about EUR 65,000", "School career fair (Meet@TUM), TUM-wide fair IKOM (about 400 companies a year), job board. Mostly consulting, project management and IT.", "https://www.mgt.tum.de/programs/master-in-management-technology")
cr("p53 p4", "good", "TUM School of Management reports 84% employed within 3 months (Management & Technology)", "TUM's career service and IKOM fairs apply; no programme-level figure for this master's.", "https://www.mgt.tum.de/programs/master-in-management-technology")
cr("p55", "strong", "92% receive a job offer within 3 months; average starting salary EUR 66,655", "WHU career service for master's students; about 43% go into consulting.", "https://www.whu.edu/en/programs/master-of-science-programs/career-service/")
cr("p26", "strong", "92% found a job within 3 months (Class of 2025); average salary EUR 69,000 with bonus", "QS 2027: 3rd in Germany for employability among Master in Management programmes.", "https://www.frankfurt-school.de/en/study/master/master-in-management")
cr("p12", "strong", "96% employed within 6 months (programme page); 95.8% across RSM MSc graduates, 2026 report", "RSM Career Centre with an annual MSc Employment Report. Survey response rate was 25%.", "https://www.rsm.nl/msc-employment-report/")
cr("p35", "strong", "97% employed within 6 months; average starting salary EUR 63,000 (2024 survey)", "Fairs, workshops and conferences; the page names few employers.", "https://www.hec.edu/en/master-s-programs/master-science-data-science-ai-business-x-hec")
cr("p25", "strong", "96% employed within 3 months (Class of 2024); average base salary about USD 72,800 PPP", "Career fairs, workshops, company presentations and recruiting events across Esade MSc programmes.", "https://www.esade.edu/master-of-science/en/program/masters-in-business-analytics/your-career-future")
cr("p29", "strong", "92% received an offer within 6 months; QS ranks the predecessor 4th worldwide for employability", "IE career reports are published each year; partner companies include Google, AWS and Microsoft.", "https://www.ie.edu/school-science-technology/programs/master-business-analytics-data-science/career-path/")
cr("p44", "strong", "95.6% employed one year after graduation; 74% employed on graduation day (2022-23)", "Bocconi runs a placement office; graduates receive about 2.2 offers on average.", "https://www.unibocconi.it/en/programs/master-science/data-science-and-business-analytics/program-placement")
cr("p40", "strong", "About 97% to 98% employed one year after graduating (Management Engineering)", "Politecnico di Milano Career Service and a mentorship programme for Management Engineering students.", "https://management-eng.polimi.it/en/after-graduation/career-opportunities/")
cr("p71", "strong", "Placement above 90% within 6 months (school's claim)", "Bologna Business School runs placement for its full-time masters. Self-reported and not audited.", "https://www.bbs.unibo.it/en/master-fulltime/master-in-data-science-2/")
cr("p39", "strong", "93.6% employed 6 months after graduating; 84% secured a job before graduation", "NHH's annual labour-market survey and career centre; 37% survey response.", "https://www.nhh.no/en/nhh-bulletin/article-archive/2023/march/new-labour-market-survey-nhh-graduates-have-never-been-so-in-demand/")
cr("p49", "strong", "86% of HSG master's graduates hold a permanent post at graduation; 1.7 offers on average (school-wide)", "HSG runs a career service with a strong Swiss employer network. Programme-level figures are not published.", "https://www.unisg.ch/en/studying/why-hsg/great-career-opportunities/")
cr("p33", "strong", "97% accepted an offer within 6 months (Class of 2025); 95% (Class of 2024)", "Employers include Amazon, Bloomberg, Google, HSBC, JP Morgan. 35% go into finance.", "https://www.imperial.ac.uk/business-school/masters/business-analytics/career-impact/")
cr("p90", "strong", "91% in jobs within 6 months (classes 2023-24); finance 37%, IT 27%", "Business School career development team; employers include Deloitte, EY, PwC.", "https://www.business-school.ed.ac.uk/msc/business-analytics/career-outcomes")
cr("p15", "strong", "87% employed within 3 months (Class of 2023); average salary CAD 80,611", "Career Strategists, 1,265 internship and job postings for the 2025-26 classes, an internship programme and the SEAT employment tool.", "https://www.sauder.ubc.ca/programs/masters-degrees/mban/career-outcomes")
cr("p23", "strong", "92% employed within 6 months (Class of 2025); average compensation CAD 84,012", "Rotman publishes an annual employment and salary report. 60% of placements are in financial services, 88% in Toronto.", "https://www.rotman.utoronto.ca/media/rotman/content-assets/documents/Rotman-MMA-Employment-and-Salary-Report-2026.pdf")
cr("p61", "strong", "97% hired within 6 months (Class of 2021; older), average salary CAD 82,306", "Schulich's Centre for Career Design; recent reports cover MBA programmes rather than the MBAN.", "https://schulich.yorku.ca/wp-content/uploads/2022/08/MBAN-Student-Success-Report-_Class-of-2021-1.pdf")
cr("p14", "strong", "About 95% internship placement over three years; an 8-month paid internship option", "The MBAN has an industry-engagement and internship pipeline.", "https://www.smu.ca/sobey/mban/students-internship-placement.html")
cr("p28 p41", "strong", "94% employed within 4 months (Monash Master of Business Analytics, QILT 2022)", "Monash Business School careers service; independent national survey (QILT).", "https://www.monash.edu/__data/assets/pdf_file/0008/3636044/2025-PG-Interational-course-guide.pdf")
cr("p73", "strong", "Annual employment report; about 80% of graduates stay in the UAE; salary AED 22,000 to 23,000 a month (2023 master's cohort)", "Compulsory summer internship in several programmes; internship fairs draw 37 to 48 employers. Self-reported.", "https://staticcdn.mbzuai.ac.ae/mbzuaiwpprd01/2026/03/MBZUAI-Annual-Employment-Report-Cohort-1-and-2.pdf")
cr("p22", "good", "83% employed less than 3 months after graduating; average salary EUR 60,000 (Class of 2024)", "ESCP lists AI Consultant and Data Scientist roles. Career-service details were thin.", "https://escp.eu/programmes/specialised-masters-MSc/MSc-in-Business-Analytics-in-AI")
cr("p27", "good", "School brochure claims up to 100% within 6 months, but another page says only 'the vast majority'", "Named recruiters include Accenture, Bain, Google and PwC. Treat the 100% claim with caution.", "https://www.essec.edu/en/program/master-data-sciences-business-analytics/")
cr("p77", "good", "94% have paid work; first job in 2.7 months on average (University of Twente alumni survey 2025)", "University-wide survey; 12.7% response rate.", "https://www.utwente.nl/en/about-us/news-events-ceremonies/news/2026/6/941799/ut-alumni-quickly-find-their-way-into-the-labour-market-and-look-back-positively-on-their-studies")
cr("p60", "good", "TU/e graduates find a first job in about 3 months on average (National Alumni Survey 2025)", "Strong ties with the Brainport industry cluster; 69% stay in the region.", "https://www.tue.nl/en/education/become-a-tue-student/student-facts-figures")
cr("p18", "good", "UvA's Data Science and Business Analytics master reports 2 months to a job and about EUR 3,363 a month (a related programme)", "No figure for this exact programme. UvA Career Services apply.", "https://www.uva.nl/en/programmes/masters/data-science-and-business-analytics/careers/careers.html")
cr("p1 p2 p3 p54", "good", "No published employment rate. The MMAAI class of 2025 reported an average 35% salary increase and 42% moving into data roles", "Mannheim Career Network: career fair, virtual job market, free application checks and a CV book. SAP, BASF, Microsoft and Deutsche Bank hire Business Informatics graduates.", "https://www.wim.uni-mannheim.de/en/academics/professional-development/career-network/")
cr("p89", "good", "No programme-level figure", "Münster Careers Service and the department's employer links (zeb, viadee, Provinzial, LVM, GAD). Around 100 graduates a year.", "https://www.wi.uni-muenster.de/prospective-students/studying-is-in-muenster")
cr("p16 p19", "good", "About 85% of WU's Economics master's graduates hold a job within 3 months; 95% for CEMS (2025). No figure for this master's", "WU's ZBP Career Center runs more than 3,000 counselling sessions a year plus employer events.", "https://www.wu.ac.at/en/programs/masters-programs/masters-program-economics/overview/career-prospects")
cr("p21", "good", "98% of Aalto business master's graduates employed in a five-year survey (2017 graduates)", "Aalto Career Services track outcomes at one and five years. Not programme-specific.", "https://www.aalto.fi/en/news/aalto-university-graduates-valued-in-the-job-market")
cr("p76", "good", "Master's graduates: 3% unemployment five years out; median salary EUR 5,100 a month", "LUT runs an annual career survey. Not programme-specific.", "https://www.lut.fi/en/news/alumni-feedback-needed-lut-universitys-career-survey")
cr("p69", "good", "94% of Helsinki graduates employed five years after graduation (class of 2018)", "University career services support you until a year after graduation. Not programme-specific.", "https://www.helsinki.fi/en/innovations-and-cooperation/alumni/graduate-employment")
cr("p36", "good", "CBS graduates have about 3.8% unemployment; 9 in 10 find private-sector jobs", "School-wide figure from CBS; no programme data.", "https://www.cbs.dk/en/news/more-people-want-study-business-cbs-breaks-another-application-record")
cr("p67", "good", "About 88% to 90% of DTU engineering master's graduates are employed within one year", "DTU-wide figure from an employer and graduate survey.", "https://www.dtu.dk/english/newsarchive/2022/08/stor-efterspoergsel-paa-nyuddannede-ingenioerer")
cr("p34", "good", "Average salary USD 71,541 PPP within 6 months (Class of 2025); no employment rate for this programme", "WBS credits its careers team; employers include JPMorgan and KPMG.", "https://www.wbs.ac.uk/news/wbs-masters-graduates-secure-high-paying-roles-in-fast-changing-job-market/")
cr("p38", "good", "No programme rate. Manchester is ranked 1st among UK universities targeted by top graduate employers (High Fliers 2026)", "Dedicated Postgraduate Careers Service; recent recruiters include Deloitte, Google, Goldman Sachs and HSBC.", "https://www.alliancembs.manchester.ac.uk/study/masters/msc-business-analytics-and-artificial-intelligence/")
cr("p65", "good", "81% overall employment counting graduates seeking work (2021-23 cohorts)", "School of Management career data page; most graduates become data analysts, consultants or business analysts.", "https://www.bath.ac.uk/campaigns/msc-in-business-analytics-career-data/")
cr("p8", "good", "DCU Business School 97% employment (Graduate Outcomes Survey, school-wide)", "No figure for this master's.", "https://business.dcu.ie/graduate-employability/")
cr("p9", "good", "85% of Business Analytics graduates found work within 6 months", "Employers include AIB, Accenture, Amazon, Deloitte and Stripe.", "https://www.tcd.ie/business/programmes/masters-programmes/msc-in-business-analytics-and-ai-for-management/careers-and-development/")
cr("p13", "good", "89% employed 6 months after graduating (Graduate Outcomes Survey 2025)", "Smurfit careers support; alumni at Deloitte and Google Cloud.", "https://www.smurfitschool.ie/programmes/masters/mscinbusinessanalytics/yourcareer/")
cr("p56", "good", "UL: 95% of taught master's graduates employed or in further study; average starting salary EUR 45,304", "UL's Cooperative Education and Careers Division is the largest co-op programme in Ireland. University-wide.", "https://www.ul.ie/study/postgraduate/articles/uls-secret-strategy-for-postgrad-career-success")
cr("p48", "good", "No published rate", "Melbourne Business School has a Career Management Centre and a supervised industry project. Employers named include Microsoft, Canva and McKinsey.", "https://mbs.edu/degree-programs/full-time-master-of-business-analytics")
cr("p63", "good", "93.6% of Deakin business postgraduates in full-time work within 4 months (QILT discipline figure)", "DeakinTALENT careers platform. Not programme-specific.", "https://www.deakin.edu.au/media-sources")
cr("p17", "good", "Auckland business graduates: employment at least 91.7% (2024, faculty-wide)", "Dedicated career development manager and 10-week applied projects, twice a year.", "https://www.auckland.ac.nz/en/business/current-students/student-support/careers-centre/explore-majors-and-careers/business-analytics.html")
cr("p47", "good", "Nine in 10 NTU graduates employed (university-wide, 2025)", "NTU Nanyang Business School careers office.", "https://www.ntu.edu.sg/business/admissions/graduate-studies/msc-business-analytics/admissions")
cr("p72", "good", "SMU graduates: 91.4% secured employment (university-wide, 2025)", "SMU career office. MITB-specific figures were not found.", "https://www.ntu.edu.sg/docs/default-source/corporate-ntu/media-hub/0388-ntu-s-class-of-2018-well-sought-after-and-earn-higher-salaries/hro_190227_fresh-graduates-from-ntu-nus-smu-and-suss.pdf")
cr("p79", "good", "Class of 2024: finance 35%, consulting 16%, technology 13% of jobs; no employment rate", "HKUST lets full-time students stay an extra half year for career exploration. Career Center runs an annual survey.", "https://msba.hkust.edu.hk/student-life/alumni-spotlight")
cr("p46", "good", "88.9% positive outcome within 12 months, 66% within 3 months (Dubai campus, 2024)", "Dubai Careers and Graduate Futures Service. University-wide, not programme-specific.", "https://www.hw.ac.uk/dubai/study/our-rankings")
cr("p75", "good", "83% found a job within 90 days; average package about USD 93,000 (2023 exit surveys)", "UT Dallas runs a Career Management Center and a paid-internship track.", "https://infosystems.utdallas.edu/ms-ba-options/")
cr("p45", "good", "100% placement for the first (2015) cohort; no current figure", "The programme lists placement professionals and employer engagement. Georgia Tech's annual career survey reports offers by degree.", "https://www.isye.gatech.edu/news/georgia-techs-ms-analytics-program-achieves-100-percent-placement")
cr("p74", "good", "100% of active graduates employed (an external 2020 report; excludes graduates outside the labour market)", "NOVA IMS reports the figure on its rankings page.", "https://novaims.unl.pt/en/education/programs/bachelor-s-degrees/ranking-accreditations-and-certifications-bachelor-s-degrees/")
cr("p84", "good", "Over 90% employed within a year (University of Warsaw graduate monitoring)", "University of Warsaw Career Office. University-wide.", "https://biurokarier.uw.edu.pl/en/career-counselling/")
cr("p85", "good", "93% found a job within 3 months (FT ranking, older data); average 2.2 months to a full-time job", "SGH Career and Alumni Center.", "https://kariera.sgh.waw.pl/en")
cr("p87", "good", "Corvinus graduates earn more than other Hungarian master's graduates in the national career-tracking system", "Salary measure, not an employment rate.", "https://www.uni-corvinus.hu/post/hir/with-a-corvinus-degree-you-can-get-a-salary-advantage-of-up-to-several-hundred-thousand-forints/?lang=en")
cr("p98", "good", "86% of master's graduates stay in Luxembourg for work two years after graduating", "University of Luxembourg graduate tracking. Measures employment in Luxembourg only.", "https://www.uni.lu/en/about/profile/facts-figures/graduates/")
cr("p30 p64 p95 p5 p58 p10 p57 p62 p20 p37 p43 p82 p42 p78 p24 p59 p31 p66 p93 p68 p91 p96 p97 p81", "basic", "No programme-level employment figures found", "A university or faculty careers service exists. I found no published outcomes for this programme.", "")
cr("p6 p11 p51 p52 p88 p92 p99 p100 p70 p83 p86 p50 p94 p32 p80", "basic", "No programme-level outcome data found", "Central university career service only. Public German and Austrian universities rarely publish programme outcomes. The online degrees (p32, p80) provide no placement support.", "")
for i in ALL:
    if i not in CAREER: CAREER[i] = {"l": "basic", "s": "No programme-level employment figures found", "n": "A university careers service exists.", "u": ""}
CAREER["p94"] = {"l": "basic", "s": "UZH graduates: 75% in permanent posts one year after graduating (2015 cohort, university-wide)", "n": "Central UZH career services.", "u": "https://www.jacobscenter.uzh.ch/dam/jcr:a6b033b2-c078-4f09-88f5-54e21f82e968/UZH_grads_income_v16.pdf"}
CAREER["p50"] = {"l": "basic", "s": "ETH publishes no master's employment figures that I found", "n": "ETH's central career service. Highly regarded in Switzerland, but no outcome data was found.", "u": ""}
for i in ids("p32 p80"):
    CAREER[i] = {"l": "limited", "s": "Online degree: no job-placement support (stated for Georgia Tech OMSA)", "n": "Value comes from keeping your job and the credential.", "u": "https://pe.gatech.edu/degrees/analytics/program-comparison"}

out = {i: {"workex": WORKEX[i], "mba": MBA[i], "iitm": IITM[i], "sap": SAP[i], "career": CAREER[i]} for i in ALL}
json.dump(out, open("data/background.json", "w"), indent=1, ensure_ascii=False)

for k in ("workex", "mba", "iitm", "sap"):
    print(k, dict(collections.Counter(out[i][k]["l"] for i in ALL)))
print("career", dict(collections.Counter(out[i]["career"]["l"] for i in ALL)))
def fits(i):
    b = out[i]; return sum(1 for k in ("workex", "mba", "iitm", "sap") if b[k]["l"] in ("strong", "ok") and b[k]["l"] != "none")
top = sorted(ALL, key=lambda i: -sum({"strong": 2, "ok": 1, "ask": 0, "none": 0, "risk": -2}[out[i][k]["l"]] for k in ("workex", "mba", "iitm", "sap")))[:14]
for i in top:
    b = out[i]; print(i, byid[i]["university"][:28], "|", byid[i]["program"][:36], "|", [b[k]["l"] for k in ("workex", "mba", "iitm", "sap")], b["career"]["l"])
