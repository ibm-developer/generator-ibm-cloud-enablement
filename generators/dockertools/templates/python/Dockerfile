FROM python:2-alpine

WORKDIR /app

COPY requirements.txt /tmp/requirements.txt
RUN apk --update add python py-pip openssl ca-certificates py-openssl wget bash linux-headers
RUN apk --update add --virtual build-dependencies libffi-dev openssl-dev python-dev py-pip build-base \
  && pip install --upgrade pip \
  && pip install -r /tmp/requirements.txt \
  && apk del build-dependencies

ENV FLASK_APP=server

COPY . /app

CMD ["gunicorn", "-b", "0.0.0.0:<%= port %>", "server:app"]
