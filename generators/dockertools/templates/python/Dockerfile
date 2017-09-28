FROM python:2-alpine

WORKDIR /app

COPY requirements.txt /tmp/requirements.txt
RUN apk --update add python py-pip openssl ca-certificates py-openssl wget bash linux-headers
RUN apk --update add --virtual build-dependencies libffi-dev openssl-dev python-dev py-pip build-base
RUN pip install --upgrade pip
RUN pip install -r /tmp/requirements.txt
RUN apk del build-dependencies

COPY . /app

# Configure FLASK_APP if running flask normally
# ENV FLASK_APP=

CMD ["echo", "Enable incomplete. See README/IDT-Enable-Instructions to finish the enable process""]
