# Start from Python 3.9
FROM python:3.9

# Move everything into /code
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt

# Install your Python packages
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Install modern OpenCV system graphics dependencies (Debian Trixie and newer)
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0

# Copy your backend code
COPY . .

# Hugging face automatically exposes and listens on Port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
