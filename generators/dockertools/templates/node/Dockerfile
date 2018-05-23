FROM node:8

# Change working directory
WORKDIR "/app"

# Update packages and install dependency packages for services
RUN apt-get update \
<% for (var index = 0; index < servicesPackages.length; index++) { -%>
 && apt-get install -y <%- servicesPackages[index] %> \
<% } -%>
 && apt-get dist-upgrade -y \
 && apt-get clean \
 && echo 'Finished installing dependencies'

# Install npm production packages 
COPY package.json /app/
RUN cd /app; npm install --production

ENV NODE_ENV production
ENV PORT <%= port %>

EXPOSE <%= port %>

CMD ["npm", "start"]



