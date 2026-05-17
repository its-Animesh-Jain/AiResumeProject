import spacy
from sentence_transformers import SentenceTransformer, util
import fitz  # PyMuPDF
from docx import Document
import re
from typing import List, Dict, Any

# Load models
nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# Universal Domain Keywords and Skills
DOMAIN_KNOWLEDGE = {
    "software": {
        "keywords": ["developer", "software", "backend", "frontend", "programming", "coding", "web development", "mobile app", "devops", "qa"],
        "skills": ["python", "javascript", "react", "fastapi", "django", "postgresql", "mongodb", "aws", "docker", "kubernetes", "typescript", "sql", "java", "c++", "c#", "machine learning", "data science"],
        "titles": ["Software Engineer", "Web Developer", "System Architect", "Backend Developer", "Frontend Developer", "DevOps Engineer"]
    },
    "finance": {
        "keywords": ["accounting", "finance", "banking", "taxation", "audit", "commerce", "investment", "wealth management", "ledger", "balance sheet"],
        "skills": ["tally", "gst", "income tax", "financial analysis", "reconciliation", "mis", "corporate finance", "risk analysis", "compliance", "excel", "auditing"],
        "titles": ["Accountant", "Financial Analyst", "Audit Manager", "Tax Consultant", "Investment Banker", "Wealth Manager"]
    },
    "medical": {
        "keywords": ["medical", "healthcare", "clinical", "hospital", "patient", "medicine", "diagnosis", "treatment", "nursing", "pharmacy", "lab"],
        "skills": ["patient care", "emergency medicine", "pharmacology", "clinical research", "anatomy", "physiology", "pathology", "radiology", "surgery"],
        "titles": ["Doctor", "Nurse", "Pharmacist", "Lab Technician", "Clinical Coordinator", "Medical Officer"]
    },
    "electrical": {
        "keywords": ["electrical", "power systems", "electronics", "circuit", "instrumentation", "embedded", "automation", "maintenance", "semiconductor"],
        "skills": ["plc", "scada", "vlsi", "matlab", "embedded systems", "circuit design", "power distribution", "autocad electrical"],
        "titles": ["Electrical Engineer", "Electronics Engineer", "Automation Engineer", "Instrumentation Engineer"]
    },
    "civil": {
        "keywords": ["civil", "construction", "structural", "infrastructure", "architecture", "site engineer", "quantity surveyor", "estimation", "surveying"],
        "skills": ["autocad", "staad pro", "revit", "project management", "tendering", "billing", "surveying", "concrete technology"],
        "titles": ["Civil Engineer", "Structural Engineer", "Site Supervisor", "Quantity Surveyor", "Project Manager"]
    },
    "teaching": {
        "keywords": ["teaching", "education", "academic", "lecturer", "faculty", "pedagogy", "curriculum", "tutor", "student", "classroom"],
        "skills": ["lesson planning", "classroom management", "educational technology", "subject matter expert", "mentoring", "research"],
        "titles": ["Teacher", "Professor", "Lecturer", "Academic Coordinator", "Tutor", "Trainer"]
    },
    "marketing": {
        "keywords": ["marketing", "sales", "branding", "advertising", "seo", "content", "digital marketing", "market research", "customer", "leads"],
        "skills": ["social media marketing", "google analytics", "content writing", "crm", "salesforce", "lead generation", "copywriting"],
        "titles": ["Marketing Manager", "Sales Executive", "Content Strategist", "Digital Marketer", "Brand Manager"]
    },
    "hr": {
        "keywords": ["human resources", "recruitment", "payroll", "employee relations", "talent acquisition", "onboarding", "performance management", "training"],
        "skills": ["sourcing", "interviewing", "labor laws", "hris", "compensation and benefits", "conflict resolution"],
        "titles": ["HR Manager", "Recruiter", "HR Generalist", "Talent Acquisition Specialist"]
    }
}

class AIService:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        doc = Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs])

    @staticmethod
    def deep_parse_resume(text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        doc = nlp(text_lower)
        
        # 1. Domain Detection
        domain_scores = {domain: 0 for domain in DOMAIN_KNOWLEDGE}
        for domain, info in DOMAIN_KNOWLEDGE.items():
            for kw in info["keywords"] + info["skills"]:
                if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                    domain_scores[domain] += 2 if kw in info["keywords"] else 1
        
        detected_domain = max(domain_scores, key=domain_scores.get)
        if domain_scores[detected_domain] == 0:
            detected_domain = "general"

        # 2. Skill Extraction (Universal)
        extracted_skills = []
        for domain, info in DOMAIN_KNOWLEDGE.items():
            for skill in info["skills"]:
                if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                    extracted_skills.append(skill)
        
        # 3. Education/Degree Detection
        degrees = []
        degree_patterns = [r"b\.?e\.?\b", r"b\.?tech\b", r"m\.?tech\b", r"b\.?sc\b", r"m\.?sc\b", r"b\.?com\b", r"m\.?com\b", r"mbbs\b", r"b\.?arch\b", r"mba\b", r"ph\.?d\b", r"graduate\b", r"post graduate\b"]
        for pattern in degree_patterns:
            if re.search(pattern, text_lower):
                degrees.append(pattern.replace(r"\b", "").replace(r"\.?", ".").upper())

        # 4. Experience Detection
        exp_match = re.search(r'(\d+)\+?\s*years?', text_lower)
        experience_years = int(exp_match.group(1)) if exp_match else 0
        
        # 5. Intent/Titles Generation for Search
        search_queries = []
        if detected_domain != "general":
            # Primary: Top skills + Domain
            search_queries.append(f"{' '.join(extracted_skills[:2])} {detected_domain}")
            # Secondary: Typical titles for domain
            search_queries.extend(DOMAIN_KNOWLEDGE[detected_domain]["titles"][:2])
        else:
            search_queries.append("software engineer") # Ultimate fallback

        return {
            "domain": detected_domain,
            "skills": list(set(extracted_skills)),
            "degrees": list(set(degrees)),
            "experience": experience_years,
            "search_queries": list(set(search_queries)),
            "full_text": text
        }

    @staticmethod
    def get_embedding(text: str):
        return embedder.encode(text, convert_to_tensor=True)

    @classmethod
    def calculate_universal_match(cls, resume_data: Dict[str, Any], job_desc: str, job_title: str) -> Dict[str, Any]:
        job_desc_lower = job_desc.lower()
        job_title_lower = job_title.lower()
        
        # 1. Semantic Content Score (40%)
        resume_embedding = cls.get_embedding(resume_data["full_text"])
        job_embedding = cls.get_embedding(job_desc)
        cosine_score = util.cos_sim(resume_embedding, job_embedding).item()

        # 2. Domain Match (20%)
        job_domain_scores = {domain: 0 for domain in DOMAIN_KNOWLEDGE}
        for domain, info in DOMAIN_KNOWLEDGE.items():
            for kw in info["keywords"] + info["skills"]:
                if re.search(r'\b' + re.escape(kw) + r'\b', job_desc_lower) or re.search(r'\b' + re.escape(kw) + r'\b', job_title_lower):
                    job_domain_scores[domain] += 1
        
        job_domain = max(job_domain_scores, key=job_domain_scores.get)
        domain_match = 1.0 if job_domain == resume_data["domain"] else 0.2
        
        # 3. Skill Overlap (30%)
        job_skills = []
        for domain, info in DOMAIN_KNOWLEDGE.items():
            for skill in info["skills"]:
                if re.search(r'\b' + re.escape(skill) + r'\b', job_desc_lower):
                    job_skills.append(skill)
        
        matched_skills = list(set(resume_data["skills"]).intersection(set(job_skills)))
        skill_score = len(matched_skills) / len(job_skills) if job_skills else 0.5

        # 4. Title Similarity (10%)
        title_sim = 0.0
        for query in resume_data["search_queries"]:
            if query.lower() in job_title_lower:
                title_sim = 1.0
                break

        # Weighted Final Score
        final_score = (cosine_score * 0.4) + (domain_match * 0.2) + (skill_score * 0.3) + (title_sim * 0.1)
        
        # Hard penalty for extreme domain mismatch
        if domain_match == 0.2 and cosine_score < 0.3:
            final_score *= 0.3

        reasons = []
        if domain_match == 1.0: reasons.append(f"Strong {resume_data['domain']} domain alignment")
        if matched_skills: reasons.append(f"Matched key skills: {', '.join(matched_skills[:3])}")
        if title_sim > 0.8: reasons.append("Job title aligns with your background")

        return {
            "match_score": round(final_score * 100, 2),
            "matched_skills": matched_skills,
            "detected_domain": resume_data["domain"],
            "reasons": reasons
        }
