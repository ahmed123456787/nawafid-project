FROM php:8.4-cli

RUN apt-get update && apt-get install -y git unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring zip bcmath gd

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html