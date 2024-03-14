# Dockerfile for building and running the application
# Frontend (react) builder
FROM node:20-alpine as builder

# Set the working directory
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

# Copy project sources
COPY ./src ./public ./*.cjs ./*.json ./*.html ./*.ts ./

# Replace "http://localhost:8000" with "/api"
RUN sed -i 's/http:\/\/localhost:8000/\/api/g' src/lib/sdk.ts

# Build the application
RUN yarn build

###############################################
# Backend (python) runner
FROM python:3.12-alpine
WORKDIR /app

# Install poetry
RUN pip install poetry

# Set the working directory
COPY poetry.lock pyproject.toml ./
# Install dependencies
RUN poetry install

# Copy dist folder from frontend
COPY --from=builder /app/dist /app/dist

# Copy project sources
COPY ./ ./

# Run the application
CMD ["sh", "run.sh", "production"]