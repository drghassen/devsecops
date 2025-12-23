# Base image
FROM python:3.13-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=nuit_info.settings

# Set work directory
WORKDIR /app

# Install system dependencies
# build-base is the Alpine equivalent of build-essential
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    libffi-dev

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Create a non-root user
RUN addgroup -S django && adduser -S django -G django

# Pre-create directories and set permissions
RUN mkdir -p /app/staticfiles /app/media /app/logs
RUN chown -R django:django /app

# Expose port
EXPOSE 8000

# Switch to non-root user
USER django

# Run the application using daphne (for ASGI support)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "nuit_info.asgi:application"]
