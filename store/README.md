# Store


This directory is supposed to be used by the application only. Don't add anything here.

Because it contains highly sensitive information, database will be added later
if necessary (no performance limitation expected)


## Notes

Le deployer ne décider pas de l'architecture. Ce qu'il fait, c'est à partir
d'une spécification d'environement minimaliste mais normalisée (`store/enviroments`)
il va faire le nécessaire pour le mettre en place (routing, computing, database)
sur les serveurs de mutualisation (computing & daemons pour le moment)


**Déploiements**
Les différentes machines ne prennent pas d'initiative pour démarrer/ajouter un service.
Elles se contentent de faire tourner les services qu'on leur demande de faire tourner
et au plus de retourner les logs et statuts.

Avec les noms actuels :
- computing et daemons executent en cascade les commandes du deployer
- deployer prend en paramètre le minimum essentiel d'informations à avoir sur les environnements
- deployer est au courant de ce qu'il a déployé : il sait quels port/noms d'app/noms de bases
il a utilisé et personne n'est censé ajouter d'éléments qui pourraient perturber ses actions.
Les seuls éléments perturbateurs seraient des pannes (de tous types) au niveau des services.
Dans  ces cas là, les opérations de vérification/cleaning/reload/... sont à lancer
en adaptant selon les cas.
- garanties de namespaces pour le deployer :
  - `/srv/services/auto-*`
  - `auto-*` pour les bases de données
  - `auto-*:` pour le namespace redis

Préfix par déploiement d'un service :
(- App : le complexe applicatif dans lequel se trouve le service)
- Environment : l'instanciation du complexe applicatif dans lequel se trouve le service
- Service : Le service en question (/path-du-service)
- Instanciation : L'instance du service en question

Grosse question sur l'instanciation : on met en ligne une nouvelle version du service,
mais avec la même base (quand c'est une nouvelle pas de pb). Dans ce cas, est-ce qu'on met à jour les sources
ou on clone dans un nouveau dossier ?
  => Possibilité : chaque exécution de déploiement (procédure complexe ou opération élémentaire) est loggué,
  et pour chacune des parties (computing, db, redis, ...), on retient le numéro d'instanciation

service ---------------------------
   |           |         |        |
   |          node     mysql    redis
   |           |         |        |
deploy 1      (1)       (1)      (1)       
   |           |         |        |
deploy 2      (2)        |        |        
   |           |         |        |
deploy 3      (3)       (2)       |        
   |           |         |        |
deploy 4       |         |       (2)       


UI / Analyser
   -> order spec (environment.yml + deploy-options.yml/environment-diff.yml)
   -> order job (folder with things to do and logs)
   -> deployer (operations, procedures)
   -> git pulls, config files (.env, proxy), commands (install, migrate)
