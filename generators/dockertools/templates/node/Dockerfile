FROM ibmcom/ibmnode

ADD . /app

ENV NODE_ENV production
ENV PORT <%= port %>

EXPOSE <%= port %>

WORKDIR "/app"

RUN apt-get update \
<% for (var index = 0; index < servicesPackages.length; index++) { -%>
 && apt-get install -y <%- servicesPackages[index] %> \
<% } -%>
 && echo 'Finished installing dependencies'
RUN npm install
CMD ["npm", "start"]
