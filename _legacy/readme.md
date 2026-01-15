# Chethan SaaS Platform

A scalable, multi-tenant SaaS boilerplate built with **FastAPI**, **React**, and **Docker**. This project is designed to accelerate the development of AI-powered SaaS products with support for chatbot agents, file uploads, user authentication, billing, and more.

---

## Features

- **Multi-Agent RAG Chatbot System**
  - Isolated knowledge bases per bot
  - Excel/JSON file upload for training
  - DeepSeek LLM integration via API
  - Qdrant Vector DB for embedding storage

- **Frontend (React + Tailwind)**
  - Responsive Admin Dashboard
  - Light/Dark theme support
  - JWT-based Authentication
  - Role-based Access Control

- **Backend (FastAPI)**
  - User & Tenant Management
  - Chatbot API endpoints
  - Stripe Integration for Billing
  - Dockerized for easy deployment

- **Integrations**
  - Stripe for billing tiers (Free, Pro, Enterprise)
  - WhatsApp, Facebook, and Webchat-ready
  - Cloudflare R2 for file storage

---

## Demo Screenshots

> *(Add screenshots/gif here once available to showcase UI and chatbot demo.)*

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/chethankumarkv123/chethan-saas.git
cd chethan-saas

# Spin up containers
docker-compose up --build