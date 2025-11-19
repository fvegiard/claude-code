#!/usr/bin/env python3
"""
PDF Parser pour l'analyse de plans électriques québécois
Extrait le texte, détecte les symboles et génère les données pour la BOM
"""

import sys
import json
import fitz  # PyMuPDF
from pathlib import Path
import pytesseract
from PIL import Image
import io
import re

class QuebecElectricalPDFParser:
    def __init__(self, pdf_path, pdf_id):
        self.pdf_path = pdf_path
        self.pdf_id = pdf_id
        self.doc = None
        self.text_content = ""
        self.detected_elements = []

    def open_pdf(self):
        """Ouvrir le document PDF"""
        try:
            self.doc = fitz.open(self.pdf_path)
            return True
        except Exception as e:
            print(json.dumps({
                "error": f"Erreur ouverture PDF: {str(e)}",
                "pdfId": self.pdf_id
            }))
            return False

    def extract_text(self):
        """Extraire tout le texte du PDF"""
        if not self.doc:
            return ""

        text_parts = []
        for page_num in range(len(self.doc)):
            page = self.doc[page_num]
            text = page.get_text()
            text_parts.append(text)

        self.text_content = "\n".join(text_parts)
        return self.text_content

    def ocr_page(self, page_num):
        """Appliquer OCR sur une page"""
        try:
            page = self.doc[page_num]
            pix = page.get_pixmap()
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            # Appliquer OCR
            text = pytesseract.image_to_string(img, lang='fra')
            return text
        except Exception as e:
            print(f"Erreur OCR page {page_num}: {str(e)}", file=sys.stderr)
            return ""

    def detect_electrical_elements(self):
        """Détecter les éléments électriques dans le texte"""
        patterns = {
            "cuisiniere": {
                "pattern": r"cuisinière|cuisiniere|range|stove",
                "category": "Appareil de cuisson",
                "compliance_check": "CEQ ≥5000W"
            },
            "chauffage": {
                "pattern": r"chauffage|radiateur|convecteur|plinthe|heating",
                "category": "Chauffage électrique",
                "compliance_check": "CEQ"
            },
            "disjoncteur": {
                "pattern": r"disjoncteur|breaker|(\d+)\s*A",
                "category": "Protection",
                "compliance_check": "CEQ"
            },
            "panneau": {
                "pattern": r"panneau|panel|tableau",
                "category": "Distribution",
                "compliance_check": "CEQ + RBQ"
            },
            "prise": {
                "pattern": r"prise|outlet|receptacle|120V",
                "category": "Prises et sorties",
                "compliance_check": "CEQ"
            },
            "luminaire": {
                "pattern": r"luminaire|lampe|light|éclairage",
                "category": "Éclairage",
                "compliance_check": "CEQ"
            },
            "cable": {
                "pattern": r"(#\d+|AWG\s*\d+|(\d+)\s*mm²)",
                "category": "Conducteurs",
                "compliance_check": "CEQ + CSA"
            },
            "moteur": {
                "pattern": r"moteur|motor|(\d+\.?\d*)\s*(HP|hp)",
                "category": "Moteurs",
                "compliance_check": "CEQ + CSA"
            }
        }

        for element_type, config in patterns.items():
            matches = re.finditer(config["pattern"], self.text_content, re.IGNORECASE)

            for match in matches:
                element = {
                    "type": element_type,
                    "category": config["category"],
                    "description": match.group(0),
                    "position": match.span(),
                    "compliance": config["compliance_check"],
                    "complianceStandard": config["compliance_check"].split('+')[0].strip(),
                    "quantity": 1,
                    "specifications": []
                }

                # Ajouter des spécifications selon le type
                if element_type == "cuisiniere":
                    element["specifications"].append("≥5000W requis par CEQ")
                    element["partNumber"] = "À déterminer"
                    element["price"] = 0

                elif element_type == "cable":
                    element["specifications"].append(f"Calibre: {match.group(0)}")
                    element["specifications"].append("Certifié CSA requis")

                elif element_type == "disjoncteur":
                    ampere_match = re.search(r'(\d+)\s*A', match.group(0))
                    if ampere_match:
                        element["specifications"].append(f"Courant nominal: {ampere_match.group(1)}A")

                self.detected_elements.append(element)

    def analyze(self):
        """Analyser le PDF complet"""
        if not self.open_pdf():
            return

        # Extraire le texte
        self.extract_text()

        # Si peu de texte, essayer OCR
        if len(self.text_content.strip()) < 100:
            ocr_texts = []
            for page_num in range(min(5, len(self.doc))):  # OCR sur les 5 premières pages max
                ocr_text = self.ocr_page(page_num)
                ocr_texts.append(ocr_text)
            self.text_content += "\n" + "\n".join(ocr_texts)

        # Détecter les éléments électriques
        self.detect_electrical_elements()

        # Regrouper les éléments similaires
        self.consolidate_elements()

        # Générer le résultat
        result = {
            "pdfId": self.pdf_id,
            "pages": len(self.doc),
            "textExtracted": len(self.text_content),
            "detectedElements": self.detected_elements,
            "detectedCount": len(self.detected_elements),
            "categories": list(set(e["category"] for e in self.detected_elements)),
            "timestamp": self.get_timestamp()
        }

        # Fermer le document
        if self.doc:
            self.doc.close()

        # Retourner le JSON
        print(json.dumps(result, ensure_ascii=False, indent=2))

    def consolidate_elements(self):
        """Consolider les éléments similaires"""
        # Grouper par description et incrémenter les quantités
        consolidated = {}
        for elem in self.detected_elements:
            key = f"{elem['type']}_{elem['description']}"
            if key in consolidated:
                consolidated[key]['quantity'] += 1
            else:
                consolidated[key] = elem.copy()

        self.detected_elements = list(consolidated.values())

    def get_timestamp(self):
        """Obtenir le timestamp actuel"""
        from datetime import datetime
        return datetime.now().isoformat()


def main():
    if len(sys.argv) < 3:
        print(json.dumps({
            "error": "Usage: python pdf-parser.py <pdf_path> <pdf_id>"
        }))
        sys.exit(1)

    pdf_path = sys.argv[1]
    pdf_id = sys.argv[2]

    parser = QuebecElectricalPDFParser(pdf_path, pdf_id)
    parser.analyze()


if __name__ == "__main__":
    main()
