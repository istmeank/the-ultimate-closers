# Configuration alternative pour le routage SPA
# À ajouter dans le fichier de configuration du serveur

# Pour Apache (.htaccess)
RewriteEngine On
RewriteBase /

# Rediriger toutes les routes vers index.html sauf les fichiers statiques
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /index.html [L]

# Pour Nginx
# location / {
#   try_files $uri $uri/ /index.html;
# }

# Pour Netlify (_redirects)
/*    /index.html   200

# Pour Vercel (vercel.json)
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
