from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors
import numpy as np
import pandas as pd
from Models import *


def get_user_data(user_id):
    historique_ids = [h.cours_id for h in Historique_Consultation.query.filter_by(user_id=user_id).all()]
    avis_ids = [a.cours_id for a in Avis.query.filter_by(user_id=user_id).all()]
    favoris_ids = [f.cours_id for f in Favoris.query.filter_by(user_id=user_id).all()]
    return set(historique_ids + avis_ids + favoris_ids)



def content_similarity_recommendations(user_id, top_n=5, sort_by_views=False):
    profil = Profils_Utilisateurs.query.filter_by(user_id=user_id).first()
    if not profil:
        return []

    domaine_pref = profil.domaine_intérêt
    objectifs_pref = profil.objectifs

    cours_all = Cours.query.all()
    user_cours_ids = get_user_data(user_id)

    # Filtrage des cours du même domaine et éventuellement des mêmes objectifs
    cours_filtrés = [
        c for c in cours_all
        if c.domaine == domaine_pref and (not objectifs_pref or c.objectifs == objectifs_pref)
    ]
    if not cours_filtrés:
        return []

    # Création d'une représentation textuelle pondérée pour chaque cours
    cours_df = [{
        'id': c.id_cours,
        'cours': c,
        'text': (
            f"{(c.domaine + ' ') * 29}"
            f"{(c.objectifs + ' ') * 3}"
            f"{(c.niveau + ' ') * 2}"
            f"{(c.langue + ' ') * 2}"
            f"{(c.type_ressource + ' ') * 1}"
        )
    } for c in cours_filtrés]

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([c['text'] for c in cours_df])
    cours_id_to_index = {c['id']: idx for idx, c in enumerate(cours_df)}

    user_indices = [cours_id_to_index[cid] for cid in user_cours_ids if cid in cours_id_to_index]
    if not user_indices:
        return []

    mean_user_vector = np.asarray(tfidf_matrix[user_indices].mean(axis=0))
    similarities = cosine_similarity(mean_user_vector, tfidf_matrix).flatten()

    # Tri des indices les plus similaires
    similar_indices = similarities.argsort()[::-1]
    recommended = [cours_df[i]['cours'] for i in similar_indices if cours_df[i]['id'] not in user_cours_ids]

    # Tri optionnel par nombre de vues
    if sort_by_views:
        recommended.sort(key=lambda c: c.nombre_vues, reverse=True)

    return recommended[:top_n]





def collaborative_knn_recommendations(user_id, k=2, top_n=20, sort_by_views=False):
    avis = Avis.query.all()
    data = [(a.user_id, a.cours_id, a.note) for a in avis]
    df = pd.DataFrame(data, columns=["user_id", "cours_id", "note"])
    
    pivot = df.pivot_table(index="user_id", columns="cours_id", values="note").fillna(0)
    # Juste après build_user_course_matrix()
    if len(pivot) <= 1 or user_id not in pivot.index:
        return []

    knn = NearestNeighbors(n_neighbors= k + 1, metric='cosine')
    knn.fit(pivot)
    distances, indices = knn.kneighbors([pivot.loc[user_id]])

    similar_users = pivot.index[indices.flatten()[1:]]
    user_courses = get_user_data(user_id)

    recommended = {}
    for uid in similar_users:
        for cid, note in pivot.loc[uid].items():
            if cid not in user_courses and note > 3.5:
                recommended[cid] = recommended.get(cid, 0) + note

    cours_recommandés = Cours.query.filter(Cours.id_cours.in_(recommended.keys())).all()
    cours_map = {c.id_cours: c for c in cours_recommandés}
    
    # Tri optionnel par note cumulée, puis par vues si demandé
    cours_final = [cours_map[cid] for cid, _ in sorted(recommended.items(), key=lambda x: (
        -x[1], -cours_map[x[0]].nombre_vues if sort_by_views else 0))]

    return cours_final[:top_n]




def hybrid_recommendations(user_id, top_n=20, sort_by_views=False):
    content = content_similarity_recommendations(user_id, top_n=top_n * 2, sort_by_views=sort_by_views)
    collaborative = collaborative_knn_recommendations(user_id, top_n=top_n, sort_by_views=sort_by_views)

    ids_seen = set()
    results = []

    for c in collaborative + content:
        if c.id_cours not in ids_seen:
            results.append(c)
            ids_seen.add(c.id_cours)
        if len(results) >= top_n:
            break

    # S’assurer qu'on retourne toujours quelque chose
    if not results:
        fallback = Cours.query.order_by(Cours.nombre_vues.desc()).limit(top_n).all()
        return fallback

    return results



