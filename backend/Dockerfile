
# # Use an official Python runtime as a parent image
# FROM python:3.11-slim

# # Set the working directory in the container
# WORKDIR /app

# # Install system dependencies needed for some Python packages (like psycopg2)
# # and for running the application.
# RUN apt-get update && apt-get install -y \
#     gcc \
#     libpq-dev \
#     # The `postgresql-client` is useful for debugging but can be removed if not needed.
#     postgresql-client \
#     --no-install-recommends \
#     && rm -rf /var/lib/apt/lists/*

# # Copy the requirements file into the container at /app
# COPY requirements.txt /app/

# # Install the dependencies
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy the rest of the application code into the container
# COPY . /app/

# # Set the command to run the application
# CMD ["uvicorn", "core.main:app", "--host", "0.0.0.0", "--port", "8001"]
# Dockerfile for the unified FastAPI backend and scheduler service

FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies from the requirements file
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend source code into the container
COPY . .

# Expose the port that the FastAPI app will run on
EXPOSE 8001
