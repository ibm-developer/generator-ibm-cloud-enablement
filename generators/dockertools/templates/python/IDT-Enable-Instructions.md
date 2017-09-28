# Prepare Your Project For Enablement

After running `idt enable`, there are a few changes you will need to make in order to properly build, run, and deploy your project to the IBM Cloud.
<% if (triage.missingDockerfile) { %>
### Dockerfile

Update the `CMD` line at the bottom of the Dockerfile to match the run-command you use to start your project.
<% } %><% if (triage.missingRequirements) { %>
### requirements.txt

Ensure that all of your `pip` dependencies are stored inside of `requirements.txt`.
<% } %>
### cli-config.yml

Update the following commands in `cli-config.yml` to match the commands you use in your project:

* `build-cmd-run`
* `test-cmd`
* `build-cmd-debug`
* `debug-cmd`

### manifest.yml

Update the `command` attribute to match the run-command you use to start your project.
