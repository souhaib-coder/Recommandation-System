# app.py (ajout de la vue)
@app.route('/cours', methods=['GET', 'POST'])
@login_required
def cours():
    form = CoursFilterForm()

    query = Cours.query  # Initialisation de la requête

    if form.validate_on_submit():
        # Récupération des filtres à partir du formulaire
        domaine_filter = form.domaine.data
        type_filter = form.type_ressource.data
        niveau_filter = form.niveau.data
        print("hello world")
        # Appliquer les filtres sur la requête
        if domaine_filter:
            query = query.filter(Cours.domaine == domaine_filter)
        if type_filter:
            query = query.filter(Cours.type_ressource == type_filter)
        if niveau_filter:
            query = query.filter(Cours.niveau == niveau_filter)
    print("hello")
    # Récupération des cours (avec ou sans filtre)
    cours = query.all()
        favoris_cours_ids = [favori.cours.id_cours for favori in current_user.favoris]  # cette ligne crée une liste favoris_cours_ids qui contient les identifiants des cours favoris de l'utilisateur.
        for cours_item in cours:
            cours_item.est_favori = cours_item.id_cours in favoris_cours_ids


    return render_template('cours_filtrer.html', cours=cours, form=form)




def calculer_similarite_content_based():
    cours = db.session.query(Cours).all()
    cours_data = [(cours.id_cours, cours.domaine, cours.objectifs) for cours in cours]

    # Fusionner les champs 'domaine' et 'objectifs' en un seul champ texte pour la vectorisation
    corpus = [f"{cours[1]} {cours[2]}" for cours in cours_data]

    # Appliquer le TF-IDF
    vectorizer = TfidfVectorizer(stop_words="french")
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Calculer la similarité entre les cours
    similarity_matrix = cosine_similarity(tfidf_matrix)

    return dict(zip([cours[0] for cours in cours_data], similarity_matrix))

# Exemple : récupérer la similarité entre tous les cours
similarite_content_based = calculer_similarite_content_based()


#2


def get_collaborative_scores(user_id):
    # Récupérer les évaluations des utilisateurs
    ratings_data = db.session.query(
        Cours.id_cours,
        Avis.user_id,
        Avis.note
    ).join(Avis, Cours.id_cours == Avis.cours_id).all()

    # Créer un DataFrame des évaluations
    ratings_df = pd.DataFrame(ratings_data, columns=['cours_id', 'user_id', 'rating'])

    # Créer une matrice utilisateur/cours
    ratings_matrix = ratings_df.pivot(index='user_id', columns='cours_id', values='rating').fillna(0)

    # Appliquer le modèle KNN
    model_knn = NearestNeighbors(metric='cosine')
    model_knn.fit(ratings_matrix.values.T)

    # Trouver les K voisins les plus proches pour un utilisateur donné
    user_ratings = ratings_matrix.loc[user_id].values.reshape(1, -1)
    distances, indices = model_knn.kneighbors(user_ratings, n_neighbors=10)

    # Récupérer les cours recommandés en fonction des voisins
    recommended_courses = []
    for idx in indices.flatten():
        recommended_courses.append(ratings_matrix.columns[idx])

    return recommended_courses

# Exemple : obtenir des recommandations basées sur le filtrage collaboratif
recommandations_collaboratives = get_collaborative_scores(user_id)

#3

def recommander_cours_hybride(user_id):
    # Obtenir les recommandations content-based
    similarite_content_based = calculer_similarite_content_based()

    # Obtenir les recommandations collaboratives
    recommandations_collaboratives = get_collaborative_scores(user_id)

    # Fusionner les deux recommandations
    # On peut par exemple ajouter un poids pour chaque approche
    hybrid_scores = {}

    for cours_id in recommandations_collaboratives:
        # Donner un score basé sur la similarité content-based
        score_content_based = np.mean(similarite_content_based.get(cours_id, []))
        score_collaborative = 1  # ici on peut ajuster le poids de la recommandation collaborative

        hybrid_scores[cours_id] = score_content_based + score_collaborative

    # Trier les cours par score hybride
    recommended_courses = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Retourner les cours recommandés
    return recommended_courses[:10]  # top 10 des cours recommandés

# Exemple : obtenir des recommandations hybrides pour un utilisateur








################


def calculer_similarite(cours1, cours2):
    # D'abord, vérifier la similarité du domaine
    if cours1.domaine != cours2.domaine:
        return 0  # Pas similaire du tout si les domaines ne correspondent pas

    # Si le domaine est similaire, on commence avec un score de 100% (ou 1.0)
    similarite = 1.0

    # Comparer les autres caractéristiques et ajouter un poids en fonction de la correspondance
    similarite_score = 0
    if cours1.niveau == cours2.niveau:
        similarite_score += 1
    if cours1.langue == cours2.langue:
        similarite_score += 1
    if cours1.objectifs == cours2.objectifs:
        similarite_score += 1
    if cours1.type_ressource == cours2.type_ressource:
        similarite_score += 1

    # Calculer la similarité proportionnelle (1 caractéristique = 0.25, 2 caractéristiques = 0.5, etc.)
    similarite += (similarite_score / 4)

    # Retourner la similarité totale entre 0 et 1
    return similarite

def recommander_cours_par_similarite(user_id):
    # Récupérer l'historique des cours de l'utilisateur
    cours_user = get_user_data(user_id)
    if not cours_user:
        return []

    # Récupérer les métadonnées des cours consultés
    cours_user_metadata = Cours.query.filter(Cours.id_cours.in_(cours_user)).all()

    # Liste des recommandations
    recommandations = []

    # Comparer chaque cours dans la base avec les cours consultés par l'utilisateur
    for cours in Cours.query.all():
        for user_cours in cours_user_metadata:
            similarite = calculer_similarite(cours, user_cours)
            if similarite > 0.5:  # Recommander uniquement les cours ayant une similarité > 50%
                recommandations.append(cours)

    # Optionnel : trier les cours recommandés selon leur similarité
    recommandations = sorted(recommandations, key=lambda c: calculer_similarite(c, user_cours), reverse=True)

    # Retourner les 5 premiers cours recommandés
    return recommandations[:5]