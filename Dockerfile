FROM ubuntu:20.04

# Path: Dockerfile

# Set the working directory
WORKDIR /app
# Copy startup.sh
COPY startup.sh poetry.lock pyproject.toml ./
# Startup
RUN chmod +x startup.sh && ./startup.sh

# Copy project sources
COPY ./ ./

# Run the application
CMD ["bash", "run.sh"]