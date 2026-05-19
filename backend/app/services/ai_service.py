import spacy
from sentence_transformers import SentenceTransformer, util
import fitz  # PyMuPDF
from docx import Document
import re
from typing import List, Dict

# Load models
try:
    nlp = spacy.load("en_core_web_sm")
except:
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

embedder = SentenceTransformer('all-MiniLM-L6-v2')

DOMAIN_KNOWLEDGE = {
    "software": ["python", "javascript", "react", "node", "java", "c++", "aws", "docker", "sql", "git", "api", "rest", "backend", "frontend", "fullstack", "devops"],
    "finance": ["accounting", "excel", "audit", "tax", "banking", "finance", "cpa", "cfa", "trading", "investment", "portfolio", "banking", "ledger"],
    "medical": ["nursing", "biology", "healthcare", "patient", "clinical", "surgery", "anatomy", "medical", "doctor", "pharmacy", "clinic", "hospital"],
    "marketing": ["seo", "content", "social media", "analytics", "branding", "marketing", "ads", "digital marketing", "campaign", "copywriting"],
    "civil": ["construction", "architecture", "structural", "surveying", "cad", "autocad", "building", "infrastructure", "civil engineer"],
    "teaching": ["education", "teaching", "pedagogy", "curriculum", "classroom", "student", "learning", "mentor", "academic"],
    "commerce": ["sales", "retail", "inventory", "e-commerce", "business development", "customer service", "supply chain", "logistics"]
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
    def analyze_resume(text: str) -> Dict:
        text_lower = text.lower()
        found_skills = set()
        for domain, skills in DOMAIN_KNOWLEDGE.items():
            for skill in skills:
                if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                    found_skills.add(skill)
        
        domain_scores = {domain: 0 for domain in DOMAIN_KNOWLEDGE}
        for domain, skills in DOMAIN_KNOWLEDGE.items():
            for skill in skills:
                if skill in found_skills:
                    domain_scores[domain] += 1
        
        detected_domain = max(domain_scores, key=domain_scores.get) if any(domain_scores.values()) else "general"
        exp_match = re.search(r'(\d+)\+?\s*years?', text_lower)
        experience = int(exp_match.group(1)) if exp_match else 0
        
        return {
            "skills": list(found_skills),
            "domain": detected_domain,
            "experience": experience
        }

    @staticmethod
    def calculate_match(resume_text: str, job_desc: str, required_skills: List[str]) -> Dict:
        if not resume_text or not job_desc:
            return {"match_score": 0, "matched_skills": [], "missing_skills": []}

        resume_emb = embedder.encode(resume_text, convert_to_tensor=True)
        job_emb = embedder.encode(job_desc, convert_to_tensor=True)
        similarity = util.cos_sim(resume_emb, job_emb).item()
        
        resume_analysis = AIService.analyze_resume(resume_text)
        resume_skills = set(resume_analysis["skills"])
        req_skills_set = set([s.lower() for s in required_skills])
        
        matched = list(resume_skills.intersection(req_skills_set))
        missing = list(req_skills_set.difference(resume_skills))
        
        # Adjust weight for similarity if skill list is empty (common for external jobs)
        if not req_skills_set:
            final_score = similarity
        else:
            skill_score = len(matched) / len(req_skills_set)
            final_score = (similarity * 0.5) + (skill_score * 0.5)
        
        # Ensure a base score for relevant text even if skills don't match perfectly
        # Boosting the final score slightly if similarity is decent
        if similarity > 0.4:
            final_score = max(final_score, similarity * 1.1)

        return {
            "match_score": min(round(final_score * 100, 2), 100.0),
            "matched_skills": matched,
            "missing_skills": missing
        }
