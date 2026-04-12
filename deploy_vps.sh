#!/bin/bash
# Script de Desplegament Inicial per a tixcore.daw.inspedralbes.cat
# A executar dins del servidor VPS com a root

echo "1. Actualitzant paquets sistema..."
apt update && apt upgrade -y

echo "2. Instal·lant depedències (Node.js 20, MySQL, Nginx, Git)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs mysql-server nginx git

echo "3. Instal·lant gestor de processos PM2..."
npm install -g pm2

echo "4. Descarregant el projecte des de GitHub..."
mkdir -p /var/www
cd /var/www
# Esborrar previ si existeix per seguretat d'execucions dobles
rm -rf tixcore
git clone https://github.com/inspedralbes/DAWTR3AaronSorianoPonce.git tixcore
cd tixcore

echo "5. Configurant la Base de Dades MySQL per primera vegada..."
# Executa l'script init.sql. Depenent de com sigui l'SQL això crearà la db `entrades_db`.
mysql -u root < db/init.sql

echo "6. Instal·lant panell Backend i posant-lo en marxa..."
cd backend
npm install
node seeder.js
pm2 start server.js --name "tixcore-backend"
cd ..

echo "7. Generant producció per al Frontend..."
cd frontend
# Assegurem la URL clau de socket apuntant al server o el root domini.
export SOCKET_URL=http://tixcore.daw.inspedralbes.cat/api
npm install
npm run build
pm2 start .output/server/index.mjs --name "tixcore-frontend"
cd ..

echo "8. Configurant el proxy invers d'Nginx al domini tixcore.daw.inspedralbes.cat..."
cat <<EOF > /etc/nginx/sites-available/tixcore.daw.inspedralbes.cat
server {
    listen 80;
    server_name tixcore.daw.inspedralbes.cat;

    # Frontend (Nuxt Web)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # API Crides directes HTTP 
    location /api/ {
        # Si fem un rewrite si és necessari, però ho deixem pel prefix
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSockets (Socket.IO) per les entrades en temps real
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Activació Nginx
ln -s /etc/nginx/sites-available/tixcore.daw.inspedralbes.cat /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "9. Preservant el PM2 per a pròxims reinicis del servidor..."
pm2 save
pm2 startup

echo "============================================="
echo " TOT CORRECTE! Desplegament finalitzat."
echo " El teu servidor porta Node, MySQL i Nginx corrents."
echo " Accedeix a: http://tixcore.daw.inspedralbes.cat"
echo "============================================="
