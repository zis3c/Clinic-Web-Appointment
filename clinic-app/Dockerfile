FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    postgresql-dev \
    nodejs \
    npm \
    supervisor \
    linux-headers

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql pgsql gd xml zip pcntl

# Install Redis extension
RUN apk add --no-cache pcre-dev $PHPIZE_DEPS \
    && pecl channel-update pecl.php.net \
    && pecl install redis-6.1.0 \
    && docker-php-ext-enable redis \
    && apk del pcre-dev $PHPIZE_DEPS

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/janjicare

# Copy existing application directory contents
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www/janjicare \
    && chmod -R 775 /var/www/janjicare/storage \
    && chmod -R 775 /var/www/janjicare/bootstrap/cache

# Install composer and npm dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction
RUN npm install --legacy-peer-deps
RUN npm run build

EXPOSE 9000
CMD ["php-fpm"]
