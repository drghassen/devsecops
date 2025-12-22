# Base image
FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=nuit_info.settings

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Create a non-root user and switch to it
RUN addgroup --system django && adduser --system --group django
RUN chown -R django:django /app
USER django

# Expose port
EXPOSE 8000

# Run the application using daphne (for ASGI support)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "nuit_info.asgi:application"]
