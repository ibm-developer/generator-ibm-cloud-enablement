FROM python:2-alpine

WORKDIR /app

COPY requirements.txt /tmp/requirements.txt
RUN cd /tmp && pip install -r requirements.txt

ENV FLASK_APP=server

COPY . /app 

CMD ["gunicorn", "-b", "0.0.0.0:<%= port %>", "server:app"]
