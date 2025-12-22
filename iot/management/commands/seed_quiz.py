from django.core.management.base import BaseCommand
from iot.models import QuizFact, QuizMood, QuizResultMessage, SystemSetting, QuizQuestion


class Command(BaseCommand):
    help = "Seed quiz facts, moods, questions, and result messages"

    def handle(self, *args, **kwargs):
        # 1. Questions
        questions = [
            {
                "q": "Votre Raspberry Pi affiche fièrement 95°C. Quelle est votre réaction professionnelle ?",
                "options": [
                    "🍳 Excellent ! Je peux enfin cuisiner mes œufs brouillés eco-friendly",
                    "🚒 Contacter immédiatement les pompiers et le GIEC",
                    "❄️ Installer un système de refroidissement adapté",
                    "🎖️ Le décorer d'une médaille pour son courage face à l'adversité thermique",
                ],
                "answer": 2,
                "reactions": {
                    "correct": ["GÉNIE THERMIQUE ! 🧊", "EXPERTISE CONFIRMÉE ! ❄️", "MAÎTRISE ABSOLUE ! 🎯"],
                    "wrong": ["AÏÏÏE ! 🔥", "FUMÉE DÉTECTÉE ! 💨", "404 COOLING NOT FOUND ! 🚨"],
                },
                "funFact": "Fun Fact™: Un Raspberry Pi à 95°C, c'est comme un marathon en costume-cravate. Techniquement possible, mais vraiment pas optimal.",
            },
            {
                "q": "Votre infrastructure IoT consomme 750W en continu. Stratégie d'optimisation ?",
                "options": [
                    "💡 C'est parfait comme veilleuse pour toute la ville",
                    "⚡ Refactoriser le code et optimiser l'architecture matérielle",
                    "☢️ Construire ma propre centrale nucléaire dans le garage",
                    "🏖️ Déménager en Islande pour profiter de l'électricité géothermique gratuite",
                ],
                "answer": 1,
                "reactions": {
                    "correct": ["ARCHITECTE CONFIRMÉ ! 🏗️", "GREEN CODE MASTER ! 💚", "EFFICACITÉ MAXIMALE ! ⚡"],
                    "wrong": ["EDF VOUS DÉTESTE ! 💸", "FACTURE INCOMING ! 📬", "RIP BUDGET ÉLECTRIQUE ! ⚰️"],
                },
                "funFact": "Réalité Check: 750W × 24h × 365j = 6570 kWh/an ≈ 985€. Votre serveur coûte plus cher que votre abonnement Netflix.",
            },
            {
                "q": "Un capteur envoie sa température au cloud toutes les 0.5 secondes. Diagnostic ?",
                "options": [
                    "📊 Monitoring de précision niveau NASA, respect",
                    "💔 Relation toxique avec le réseau détectée",
                    "🎯 Parfait pour saturer la bande passante du voisin",
                    "🤖 Le capteur souffre clairement de solitude et cherche de l'attention",
                ],
                "answer": 1,
                "reactions": {
                    "correct": ["PSYCHOLOGUE DES RÉSEAUX ! 🧠", "DIAGNOSTIC PARFAIT ! 🩺", "THÉRAPIE RÉSEAU VALIDÉE ! 💊"],
                    "wrong": ["BANDE PASSANTE EN PLS ! 🚑", "LE ROUTEUR PLEURE ! 😭", "NETWORK CONGESTION DETECTED ! 🚦"],
                },
                "funFact": "Math Time: Passer de 0.5s à 10s = économiser 95% de bande passante. Votre capteur n'a pas besoin de vous parler plus qu'un adolescent.",
            },
            {
                "q": "Votre Arduino de 2014 fonctionne parfaitement. Action recommandée ?",
                "options": [
                    "🏛️ Le donner au Musée du Louvre, département 'Antiquités Numériques'",
                    "⚰️ Organiser des funérailles dignes avec hymne national",
                    "♻️ Le garder et l'utiliser, le meilleur déchet est celui qu'on ne produit pas",
                    "💰 Le vendre sur eBay comme 'Vintage Collector Limited Edition'",
                ],
                "answer": 2,
                "reactions": {
                    "correct": ["ÉCO-GUERRIER LÉGENDAIRE ! ♻️", "SAGESSE ANCESTRALE ! 🧙", "ANTI-GASPILLAGE PRO ! 🌍"],
                    "wrong": ["MARIE KONDO N'APPROUVE PAS ! 📦", "GASPILLAGE SPOTTED ! 🗑️", "L'OBSOLESCENCE MENT ! 🎭"],
                },
                "funFact": "Plot Twist: L'électronique la plus écolo ? Celle que vous n'achetez PAS. Votre vieux Arduino = 0g de CO₂ supplémentaire.",
            },
            {
                "q": "Score écologique d'un device: 8/100. Interprétation professionnelle ?",
                "options": [
                    "🎉 8 c'est mieux que 0, c'est déjà ça de pris !",
                    "☢️ C'est un Tchernobyl numérique ambulant",
                    "📉 Le score IQ du développeur qui a codé ça",
                    "🏃 Temps de courir vers la déchetterie la plus proche",
                ],
                "answer": 1,
                "reactions": {
                    "correct": ["VERDICT IMPITOYABLE ! ⚖️", "VÉRITÉ BRUTALE ! 💀", "DIAGNOSTIC SANS FILTRE ! 🔬"],
                    "wrong": ["DÉNI CLIMATIQUE DÉTECTÉ ! 🌡️", "L'OPTIMISME TUE ! ☠️", "RÉALITÉ CHECK NEEDED ! 👓"],
                },
                "funFact": "Breaking News: Score < 15 = Votre device a l'empreinte carbone d'un SUV diesel. Mais en plus petit.",
            },
            {
                "q": "Stratégie ultime pour réduire les émissions CO₂ de votre stack IoT ?",
                "options": [
                    "🌳 Planter une forêt autour du datacenter (aesthetic + efficace)",
                    "🚴 Promettre de faire du vélo pendant 10 ans (compensation karmique)",
                    "💻 Optimiser le code, réduire les requêtes, mesurer l'impact réel",
                    "💳 Acheter des crédits carbone sur Amazon Prime",
                ],
                "answer": 2,
                "reactions": {
                    "correct": ["INGÉNIEUR ÉCLAIRÉ ! 💡", "PRAGMATISME MAXIMUM ! 🎯", "SOLUTIONS RÉELLES ! 🔧"],
                    "wrong": ["GREENWASHING ALERT ! 🚨", "MARKETING > SCIENCE ! 🎪", "ESSAIE ENCORE ! 🎲"],
                },
                "funFact": "Reality Check: 1h de streaming = 50g CO₂. Votre IoT mal optimisé = plusieurs Netflix qui tournent en boucle.",
            },
            {
                "q": "RAM à 98% depuis 3 jours. Votre diagnostic d'expert ?",
                "options": [
                    "💪 La RAM adore être occupée, c'est son kink",
                    "🐛 Memory leak détecté, le code fuit comme le Titanic",
                    "✨ C'est pas un bug, c'est une feature documentée quelque part probablement",
                    "🔥 Parfait pour transformer votre bureau en sauna finlandais",
                ],
                "answer": 1,
                "reactions": {
                    "correct": ["DEBUG KING ! 👑", "SHERLOCK HOLMES DU CODE ! 🔍", "LEAK HUNTER PRO ! 🎯"],
                    "wrong": ["SEGFAULT IMMINENT ! ⚠️", "KERNEL PANIC ! 😱", "MALLOC A DIT NON ! 🚫"],
                },
                "funFact": "Pro Tip: Un memory leak = votre code collectionne les souvenirs comme votre ex. Sauf qu'ici ça crash vraiment.",
            },
            {
                "q": "CPU à 100% pour afficher 'Hello World' sur un LED. Analyse ?",
                "options": [
                    "🎨 C'est de l'art conceptuel computationnel",
                    "💩 Quelqu'un a oublié un while(true) quelque part",
                    "🏋️ Le CPU fait juste sa muscu quotidienne",
                    "🎓 Preuve que vous avez fait l'École 42",
                ],
                "answer": 1,
                "reactions": {
                    "correct": ["CODE REVIEWER SUPRÊME ! 👨‍💻", "BUG FINDER ULTIME ! 🐞", "LOGIQUE IMPARABLE ! 🧮"],
                    "wrong": ["INFINITE LOOP SPOTTED ! ♾️", "CPU EN BURNOUT ! 🔥", "CTRL+C CTRL+C CTRL+C ! ⌨️"],
                },
                "funFact": "Backstory: Afficher 'Hello World' devrait utiliser ~1% CPU. Si c'est 100%, vous minez peut-être du Bitcoin sans le savoir.",
            },
            {
                "q": "Votre boss veut 50 dashboards qui se refresh toutes les 0.3s. Réponse pro ?",
                "options": [
                    "🎯 'Excellent ! On va avoir le dashboard le plus réactif de l'univers !'",
                    "📊 'On peut faire 1 dashboard bien conçu avec refresh intelligent à la place ?'",
                    "💸 'Je vais commander 10 serveurs supplémentaires'",
                    "🏃 'Je démissionne et je pars élever des chèvres en Ardèche'",
                ],
                "answer": 1,
                "reactions": {
                    "correct": ["DIPLOMATIE TECHNIQUE ! 🎭", "LEADERSHIP ÉCLAIRÉ ! 💡", "COURAGE MANAGÉRIAL ! 🦸"],
                    "wrong": ["SERVEUR SUICIDE IMMINENT ! 💀", "DATABASE GONNA CRY ! 😭", "OPS TEAM DÉMISSIONNE ! 🏃"],
                },
                "funFact": "Secret Sauce: 1 dashboard intelligent > 50 dashboards qui spamment votre BDD comme un bot Telegram.",
            },
            {
                "q": "LA règle d'or ultime de l'IoT éco-responsable selon les légendes ?",
                "options": [
                    "💰 'Acheter le device le plus cher, c'est forcément le meilleur'",
                    "📏 'Mesurer, analyser, optimiser, PUIS upgrader si nécessaire'",
                    "🌈 'RGB sur tout, l'écologie c'est aussi l'esthétique'",
                    "📱 'Plus y'a de microservices, plus c'est écolo' (logique Kubernetes)",
                ],
                "answer": 1,
                "reactions": {
                    "correct": ["SENSEI CONFIRMÉ ! 🥋", "MAÎTRE JEDI ! ⚔️", "LÉGENDE VIVANTE ! 🏆"],
                    "wrong": ["MARKETING TRAP ! 🪤", "HYPE TRAIN MISSED ! 🚂", "BASICS NEEDED ! 📚"],
                },
                "funFact": "Wisdom Drop: Mesurer avant d'agir = la différence entre un ingénieur et quelqu'un qui devine en fermant les yeux.",
            },
        ]

        for idx, q_data in enumerate(questions):
            QuizQuestion.objects.get_or_create(
                question=q_data["q"],
                defaults={
                    "options": q_data["options"],
                    "correct_answer": q_data["answer"],
                    "reactions_correct": q_data["reactions"]["correct"],
                    "reactions_wrong": q_data["reactions"]["wrong"],
                    "fun_fact": q_data["funFact"],
                    "order": idx + 1,
                },
            )
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(questions)} questions"))

        # 2. Random Facts
        facts = [
            "Un Raspberry Pi bien optimisé consomme moins qu'une ampoule LED. Oui, vraiment.",
            "Internet pèse environ 50 grammes. Non je déconne, mais les datacenters consomment 1% de l'électricité mondiale.",
            "Envoyer un email = 4g de CO₂. Arrêtez de CC tout le monde.",
            "Un serveur mal optimisé = chauffage gratuit. Mais cher quand même.",
            "Le cloud c'est juste l'ordinateur de quelqu'un d'autre qui consomme aussi.",
            "Votre vieux device qui marche > nouveau device 'éco' en termes d'impact.",
            "Un code optimisé peut réduire la consommation de 70%. C'est pas magique, c'est juste bien codé.",
        ]

        for fact_text in facts:
            QuizFact.objects.get_or_create(text=fact_text)

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(facts)} facts"))

        # 3. Moods
        moods = [
            {"emoji": "🤔", "text": "Hmm... Intéressant", "color": "rgba(148,163,184,0.1)", "min_percentage": 0},
            {"emoji": "😅", "text": "Bon début !", "color": "rgba(245,158,11,0.1)", "min_percentage": 20},
            {"emoji": "😊", "text": "Ça chauffe !", "color": "rgba(67,97,238,0.1)", "min_percentage": 40},
            {"emoji": "😎", "text": "On the fire ! 🔥", "color": "rgba(16,185,129,0.15)", "min_percentage": 60},
            {"emoji": "🤩", "text": "INCROYABLE !", "color": "rgba(16,185,129,0.15)", "min_percentage": 80},
            {"emoji": "🏆", "text": "LÉGENDE ABSOLUE !", "color": "rgba(245,158,11,0.2)", "min_percentage": 100},
        ]

        for m in moods:
            QuizMood.objects.get_or_create(
                min_percentage=m["min_percentage"], defaults={"emoji": m["emoji"], "text": m["text"], "color": m["color"]}
            )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(moods)} moods"))

        # 4. Result Messages
        results = [
            {
                "min_percentage": 100,
                "title": "🎯 SCORE PARFAIT ! LÉGENDE CONFIRMÉE !",
                "message": "Vous êtes officiellement un Maître Jedi de l'IoT Éco-Responsable. Même Yoda est jaloux.",
                "emoji": "👑",
                "color_class": "warning",
                "badge_text": "🏆 PERFECTION ABSOLUE",
            },
            {
                "min_percentage": 80,
                "title": "🔥 EXCELLENT ! Vous êtes dans le Top 1% !",
                "message": "Niveau: Expert Senior Principal Architect Lead. Vous pouvez mettre ça sur LinkedIn.",
                "emoji": "🚀",
                "color_class": "success",
                "badge_text": "⭐ EXPERT CONFIRMÉ",
            },
            {
                "min_percentage": 60,
                "title": "👍 Solide ! Vous maîtrisez les bases !",
                "message": "Niveau: Développeur Conscient. Vous êtes sur la bonne voie, padawan.",
                "emoji": "😎",
                "color_class": "primary",
                "badge_text": "💎 BON NIVEAU",
            },
            {
                "min_percentage": 40,
                "title": "😅 Pas mal ! Mais faut réviser un peu...",
                "message": "Niveau: Junior Prometteur. On sent le potentiel, mais faut bosser.",
                "emoji": "📚",
                "color_class": "info",
                "badge_text": "📖 EN APPRENTISSAGE",
            },
            {
                "min_percentage": 20,
                "title": "😬 Ouch... Houston, we have a problem",
                "message": "Niveau: Stagiaire Premier Jour. Pas de panique, tout le monde est passé par là !",
                "emoji": "🆘",
                "color_class": "warning",
                "badge_text": "⚠️ BESOIN DE FORMATION",
            },
            {
                "min_percentage": 0,
                "title": "💀 Résultat... surprenant !",
                "message": "Niveau: Réponses Aléatoires. Un singe qui tape au hasard aurait fait mieux (désolé).",
                "emoji": "🙈",
                "color_class": "danger",
                "badge_text": "🚨 URGENT: RELIRE LES DOCS",
            },
        ]

        for r in results:
            QuizResultMessage.objects.get_or_create(
                min_percentage=r["min_percentage"],
                defaults={
                    "title": r["title"],
                    "message": r["message"],
                    "emoji": r["emoji"],
                    "color_class": r["color_class"],
                    "badge_text": r["badge_text"],
                },
            )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(results)} result messages"))

        # 5. System Settings
        settings = [
            {"key": "chatbot_url", "value": "http://37.59.116.54:8000/chat", "description": "URL of the external AI service"},
            {"key": "cpu_threshold", "value": "80", "description": "CPU usage threshold for warnings (%)"},
            {"key": "ram_threshold", "value": "85", "description": "RAM usage threshold for warnings (%)"},
            {"key": "power_threshold", "value": "250", "description": "Power consumption threshold for warnings (W)"},
            {"key": "co2_threshold", "value": "150", "description": "CO2 emissions threshold for warnings (g)"},
            {"key": "eco_threshold", "value": "50", "description": "Minimum eco-score before alert"},
        ]

        for s in settings:
            SystemSetting.objects.get_or_create(key=s["key"], defaults={"value": s["value"], "description": s["description"]})

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(settings)} system settings"))
