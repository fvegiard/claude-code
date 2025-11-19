#!/usr/bin/env python3
"""
FAISS Knowledge Base Manager
Gestion de la base de connaissances vectorielle pour les normes électriques québécoises
"""

import sys
import json
import numpy as np
from pathlib import Path
import pickle
from datetime import datetime

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    print("FAISS not available, using mock mode", file=sys.stderr)

class QuebecElectricalKnowledgeBase:
    def __init__(self, index_path='./faiss_index'):
        self.index_path = Path(index_path)
        self.index = None
        self.documents = []
        self.dimension = 384  # Dimension pour embeddings

    def initialize(self):
        """Initialiser ou charger l'index FAISS"""
        if FAISS_AVAILABLE:
            if self.index_path.exists():
                self.load_index()
            else:
                self.create_index()
        else:
            # Mode mock sans FAISS
            self.create_mock_index()

    def create_index(self):
        """Créer un nouvel index FAISS"""
        if not FAISS_AVAILABLE:
            return

        # Créer un index avec distance cosine
        self.index = faiss.IndexFlatIP(self.dimension)

        # Charger les documents de normes
        self.load_norms()

        # Sauvegarder
        self.save_index()

    def create_mock_index(self):
        """Créer un index mock pour tests"""
        self.documents = self.get_mock_documents()

    def get_mock_documents(self):
        """Obtenir des documents mock pour tests"""
        return [
            {
                "id": "ceq_8_200",
                "title": "CEQ Article 8-200 - Cuisinière électrique",
                "content": "Les cuisinières électriques doivent avoir une puissance minimale de 5000W et être alimentées par un circuit dédié de 240V, 40-50A.",
                "category": "CEQ",
                "reference": "CEQ 8-200",
                "tags": ["cuisinière", "5000W", "240V", "circuit dédié"]
            },
            {
                "id": "ceq_4_004",
                "title": "CEQ Article 4-004 - Dimensionnement des conducteurs",
                "content": "Les conducteurs doivent être dimensionnés selon les tableaux de l'annexe D pour supporter le courant nominal avec facteur de correction pour température ambiante.",
                "category": "CEQ",
                "reference": "CEQ 4-004",
                "tags": ["conducteurs", "dimensionnement", "ampérage", "température"]
            },
            {
                "id": "rsst_sect_electricity",
                "title": "RSST - Travaux électriques sous tension",
                "content": "Les travaux sous tension ne peuvent être effectués que par des électriciens qualifiés avec équipement de protection individuelle approprié selon la tension.",
                "category": "RSST",
                "reference": "RSST Section Électricité",
                "tags": ["sécurité", "tension", "EPI", "qualification"]
            },
            {
                "id": "csa_certification",
                "title": "CSA - Certification du matériel",
                "content": "Tout le matériel électrique utilisé au Québec doit être certifié CSA ou équivalent reconnu (UL, ETL) pour assurer la conformité et la sécurité.",
                "category": "CSA",
                "reference": "CSA Général",
                "tags": ["certification", "CSA", "UL", "matériel"]
            },
            {
                "id": "winter_specifications",
                "title": "Spécifications hivernales",
                "content": "Le matériel électrique extérieur doit être certifié pour températures extrêmes (-40°C) avec protection contre l'humidité et isolants adaptés au climat québécois.",
                "category": "Spécifications",
                "reference": "Climat Québec",
                "tags": ["hiver", "température", "extérieur", "-40°C"]
            },
            {
                "id": "rbq_certification",
                "title": "RBQ - Licence d'électricien",
                "content": "Les travaux électriques doivent être effectués par un électricien licencié RBQ avec licence appropriée selon le type de travaux (résidentiel, commercial, industriel).",
                "category": "RBQ",
                "reference": "RBQ Licences",
                "tags": ["licence", "électricien", "RBQ", "qualification"]
            },
            {
                "id": "ceq_14_100",
                "title": "CEQ Article 14-100 - Protection contre les surintensités",
                "content": "Chaque circuit doit être protégé par un dispositif de protection contre les surintensités (disjoncteur ou fusible) adapté au calibre des conducteurs.",
                "category": "CEQ",
                "reference": "CEQ 14-100",
                "tags": ["protection", "disjoncteur", "surintensité", "fusible"]
            },
            {
                "id": "ceq_62_heating",
                "title": "CEQ Section 62 - Chauffage électrique fixe",
                "content": "Les installations de chauffage électrique fixes doivent respecter les charges nominales, avoir des thermostats appropriés et des circuits dédiés selon la puissance totale.",
                "category": "CEQ",
                "reference": "CEQ Section 62",
                "tags": ["chauffage", "thermostats", "circuits", "puissance"]
            }
        ]

    def load_norms(self):
        """Charger les documents de normes depuis les fichiers"""
        # CEQ
        ceq_path = self.index_path.parent / 'quebec-norms' / 'CEQ'
        # RSST
        rsst_path = self.index_path.parent / 'quebec-norms' / 'RSST'
        # RBQ
        rbq_path = self.index_path.parent / 'quebec-norms' / 'RBQ'
        # CSA
        csa_path = self.index_path.parent / 'quebec-norms' / 'CSA'

        # Pour l'instant, utiliser les mocks
        self.documents = self.get_mock_documents()

    def search(self, query, top_k=5, category='all'):
        """Rechercher dans la base de connaissances"""
        # Mode simple: recherche textuelle sur les mocks
        results = []

        query_lower = query.lower()
        for doc in self.documents:
            if category != 'all' and doc['category'].lower() != category.lower():
                continue

            # Score simple basé sur correspondance de mots
            score = 0
            content_lower = doc['content'].lower()
            title_lower = doc['title'].lower()

            for word in query_lower.split():
                if word in content_lower:
                    score += 2
                if word in title_lower:
                    score += 3
                if word in [tag.lower() for tag in doc.get('tags', [])]:
                    score += 5

            if score > 0:
                results.append({
                    **doc,
                    'score': score / 10.0  # Normaliser le score
                })

        # Trier par score
        results.sort(key=lambda x: x['score'], reverse=True)

        return {
            "matches": results[:top_k],
            "count": len(results),
            "query": query,
            "category": category
        }

    def get_article(self, article_id):
        """Obtenir un article spécifique"""
        for doc in self.documents:
            if doc['id'] == article_id:
                return doc

        return None

    def get_stats(self):
        """Obtenir les statistiques de la base"""
        categories = {}
        for doc in self.documents:
            cat = doc['category']
            categories[cat] = categories.get(cat, 0) + 1

        return {
            "total_documents": len(self.documents),
            "categories": categories,
            "index_type": "FAISS" if FAISS_AVAILABLE else "Mock",
            "dimension": self.dimension,
            "last_updated": datetime.now().isoformat()
        }

    def save_index(self):
        """Sauvegarder l'index"""
        self.index_path.mkdir(parents=True, exist_ok=True)

        if FAISS_AVAILABLE and self.index:
            faiss.write_index(self.index, str(self.index_path / 'index.faiss'))

        # Sauvegarder les documents
        with open(self.index_path / 'documents.pkl', 'wb') as f:
            pickle.dump(self.documents, f)

    def load_index(self):
        """Charger l'index existant"""
        if FAISS_AVAILABLE:
            index_file = self.index_path / 'index.faiss'
            if index_file.exists():
                self.index = faiss.read_index(str(index_file))

        # Charger les documents
        docs_file = self.index_path / 'documents.pkl'
        if docs_file.exists():
            with open(docs_file, 'rb') as f:
                self.documents = pickle.load(f)


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: python faiss-manager.py <command> [args...]"
        }))
        sys.exit(1)

    command = sys.argv[1]

    kb = QuebecElectricalKnowledgeBase()
    kb.initialize()

    if command == "search":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Query required"}))
            sys.exit(1)

        query = sys.argv[2]
        top_k = int(sys.argv[3]) if len(sys.argv) > 3 else 5
        category = sys.argv[4] if len(sys.argv) > 4 else 'all'

        results = kb.search(query, top_k, category)
        print(json.dumps(results, ensure_ascii=False, indent=2))

    elif command == "get-article":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Article ID required"}))
            sys.exit(1)

        article_id = sys.argv[2]
        article = kb.get_article(article_id)

        if article:
            print(json.dumps(article, ensure_ascii=False, indent=2))
        else:
            print(json.dumps({"error": "Article not found"}))
            sys.exit(1)

    elif command == "stats":
        stats = kb.get_stats()
        print(json.dumps(stats, ensure_ascii=False, indent=2))

    elif command == "build":
        kb.save_index()
        print(json.dumps({
            "success": True,
            "message": "Index built and saved",
            "stats": kb.get_stats()
        }, ensure_ascii=False, indent=2))

    else:
        print(json.dumps({
            "error": f"Unknown command: {command}"
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
