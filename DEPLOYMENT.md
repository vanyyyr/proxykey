## Как запустить ProxyKey на сервере (Production)

Для развертывания проекта на VPS (например Ubuntu 22.04) выполните следующие шаги:

### 1. Подготовка сервера
Установите Docker и Docker Compose:
```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable --now docker
```

### 2. Клонирование и настройка
Скопируйте файлы вашего проекта на сервер (в папку `/opt/proxykey`).
Перейдите в папку проекта:
```bash
cd /opt/proxykey
```

Отредактируйте `.env` файл (или укажите переменные прямо в `docker-compose.yml`), обязательно заменив дефолтные значения:
- `DATABASE_URL` — строка подключения к PostgreSQL (как в docker-compose.yml)
- `JWT_SECRET` — придумайте сложный секретный ключ (например, результат команды `openssl rand -base64 32`)
- `TELEGRAM_BOT_TOKEN` — токен вашего Telegram бота (от @BotFather)
- `NEXT_PUBLIC_SITE_URL` — ваш домен (например, `https://proxykey.com`)
- `MARZBAN_URL`, `MARZBAN_USERNAME`, `MARZBAN_PASSWORD` — доступы к вашему Marzban.

### 2.1 Настройка Telegram Login Widget
Чтобы авторизация на сайте работала корректно, необходимо явно разрешить вашему домену (сайту) обращаться к Telegram для входа:
1. Зайдите в Telegram к официальному боту `@BotFather`.
2. Выберите вашего бота (например, отправив команду `/mybots` и выбрав бота).
3. В меню бота нажмите кнопку **Bot Settings** (Настройки бота).
4. В следующем меню нажмите **Web Login** (или **Domain**, в зависимости от интерфейса).
5. Нажмите **Enter URL**, чтобы задать адрес сайта.
6. Введите домен, который вы используете для ProxyKey:
   - Если сайт развернут на Vercel, введите точный URL-адрес вашего проекта, начинающийся с `https://` (например, `https://proxykey-app.vercel.app`).
   - Если у вас есть собственный привязанный домен, вводите его `https://vash-domain.ru`.

### 3. Запуск контейнеров
Соберите и запустите проект в фоновом режиме:
```bash
sudo docker-compose up -d --build
```
*Замечание: При первом запуске скрипт автоматически применит миграции базы данных PostgreSQL через `npx prisma migrate deploy`.*

### 4. Настройка Nginx (Reverse Proxy + SSL)
Установите Nginx:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Создайте конфигурацию для вашего домена `/etc/nginx/sites-available/proxykey`:
```nginx
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активируйте конфиг и получите SSL сертификат:
```bash
sudo ln -s /etc/nginx/sites-available/proxykey /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d your-domain.com
```

### 5. Создание админа
Поскольку база данных чистая, вам нужно создать первого администратора или заполнить настройки по умолчанию. 
Вы можете подключиться к контейнеру и выполнить seed:
```bash
sudo docker exec -it proxykey-app npx prisma db seed
```

Теперь ваш сервис доступен по HTTPS на вашем домене! 🚀
