FROM python:2-alpine

WORKDIR /app

COPY requirements.txt /tmp/requirements.txt
RUN apk --update add python py-pip openssl ca-certificates py-openssl wget bash linux-headers
RUN apk --update add --virtual build-dependencies libffi-dev openssl-dev python-dev py-pip build-base \
<% for (var index = 0; index < servicesPackages.length; index++) { -%>
  <%- servicesPackages[index] %> \
<% } -%>
  && pip install --upgrade pip \
  && pip install --upgrade pipenv\
  && pip install --upgrade -r /tmp/requirements.txt\
  && apk del build-dependencies

COPY . /app
<% if (!enable) { %>
<% if (language === "PYTHON") { %>
ENV FLASK_APP=server
<% } else { %>
ENV DJANGO_APP=<%= name %>
<% } %>
<% } %>
<% if (enable) { %>
CMD ["echo", "Enable incomplete. See README/IDT-Enable-Instructions to finish the enable process""]
<% } else { %>
<% if (language === "PYTHON") { %>
CMD ["gunicorn", "-b", "0.0.0.0:<%= port %>", "server:app"]
<% } else { %>
CMD ["gunicorn", "-b", "0.0.0.0:<%= port %>", "<%= name %>.wsgi"]
<% } %>
<% } %>