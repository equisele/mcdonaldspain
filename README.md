# Scraping de Restaurantes McDonalds en España

Este sencillo script creado con Node.js extrae todos los restaurantes McDonalds existentes en España mediante ingeniería inversa de la API de McDonalds. 
El fin de este código es meramente educativo.

En primer lugar, he obtenido una bbdd en formato .csv Quizá un poco antigua porque es de hace 10 años aproximadamente. Seguidamente realiza una iteración sobre el archivo cities-spain-top.csv
para realizar una peticíon a la API introduciendo las coordenadas geográficas de las 350 ciudades con más población de España en un radio de 100 km.

Seguidamente obtiene todos los restaurantes y datos que devuelve el API, los procesa y exporta en formato JSON y CSV que se guardarán en la carpeta /output/

## To-dos 

Ahora mismo solo está limpio de duplicados el archivo json llamado mcrestaurantspain.json y queda pendiente la limpieza de duplicados en el archivo mcrestaurantspain.csv

