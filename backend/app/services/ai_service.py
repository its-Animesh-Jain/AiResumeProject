import spacy
from sentence_transformers import SentenceTransformer, util
import fitz  # PyMuPDF
from docx import Document
import re

# Load models
nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

SKILL_LIST = [
    "python", "javascript", "react", "fastapi", "django", "postgresql", "mongodb",
    "spacy", "scikit-learn", "tensorflow", "pytorch", "aws", "docker", "kubernetes",
    "html", "css", "typescript", "redux", "nextjs", "sql", "java", "c++", "c#",
    "php", "laravel", "go", "rust", "machine learning", "data science", "nlp",
    "cloud computing", "azure", "gcp", "devops", "ci/cd", "rest api", "graphql",
    "agile", "scrum", "git", "linux", "flutter", "react native", "swift", "kotlin",
    "nodejs", "express", "vuejs", "angular", "bootstrap", "tailwind", "sass"
]

class AIService:
    @staticmethod
    def extract_text_from_pdf(file_path):
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text

    @staticmethod
    def extract_text_from_docx(file_path):
        doc = Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs])

    @staticmethod
    def extract_skills(text):
        doc = nlp(text.lower())
        found_skills = set()
        for skill in SKILL_LIST:
            if re.search(r'\b' + re.escape(skill) + r'\b', text.lower()):
                found_skills.add(skill)
        return list(found_skills)

    @staticmethod
    def extract_experience(text):
        # Very basic regex-based experience extraction
        years = re.findall(r'(\d+)\+?\s*years?', text.lower())
        if years:
            return max([int(y) for y in years])
        return 0

    @staticmethod
    def get_embedding(text):
        return embedder.encode(text, convert_to_tensor=True)

    @classmethod
    def calculate_match(cls, resume_text, job_description, required_skills):
        # Cosine Similarity of overall content
        resume_embedding = cls.get_embedding(resume_text)
        job_embedding = cls.get_embedding(job_description)
        cosine_score = util.cos_sim(resume_embedding, job_embedding).item()

        # Skill Overlap Score
        resume_skills = set(cls.extract_skills(resume_text))
        required_skills_set = set([s.lower() for s in required_skills])
        
        matched_skills = list(resume_skills.intersection(required_skills_set))
        missing_skills = list(required_skills_set.difference(resume_skills))
        
        skill_score = len(matched_skills) / len(required_skills_set) if required_skills_set else 1.0
        
        # Weighted Final Score
        final_score = (cosine_score * 0.4) + (skill_score * 0.6)
        
        return {
            "match_score": round(final_score * 100, 2),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills
        }
