FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python3", "examples/run_all.py"]
