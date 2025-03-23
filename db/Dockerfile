FROM postgres:16

# Configuración de locale
RUN localedef -i es_ES -c -f UTF-8 -A /usr/share/locale/locale.alias es_ES.UTF-8
ENV LANG es_ES.utf8

# Copiar scripts de inicialización si los hay
