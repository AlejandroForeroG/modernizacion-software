# Imagen de Postgres tal cual. Spring Boot inicializa el esquema y los datos
# de PetClinic por su cuenta (spring.sql.init.mode=always con el perfil
# "postgres"), así que aquí no hace falta copiar scripts a docker-entrypoint-initdb.d.
# Se mantiene como Dockerfile independiente para poder fijar versión/config
# propias sin tocar la imagen del backend.
FROM postgres:18.3
