# Frontend

If you need the backend to be running:
1. Head to the root folder 
```bash
cd path-to\LetsMeet
```
2. Create .env (if haven't already)
```bash
cp .env.example .env
```
3. Change environment variables (especially gemini API key, database can be left out)
- See how to get API key: [Get API key](../backend/README.md#configuration)

4. Open Docker Desktop
- Download link: [Download Link](https://www.docker.com/products/docker-desktop/)

5. Run the following command:
```bash
docker compose up -d --build
```
6. To turn off, run the following command:
```bash
docker compose down
```