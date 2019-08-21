#!/bin/bash
#set -x

#View build properties
cat build.properties

# JR Note
#========================================================
# I think we still do this. Nothing changes in this block
#
#========================================================
echo "Check cluster availability"
IP_ADDR=$(ibmcloud cs workers ${PIPELINE_KUBERNETES_CLUSTER_NAME} | grep normal | head -n 1 | awk '{ print $2 }')
if [ -z $IP_ADDR ]; then
    echo "$PIPELINE_KUBERNETES_CLUSTER_NAME not created or workers not ready"
    exit 1
fi

# JR Note
#========================================================
# This namespace value comes from the toolchain.yml file.
# It is statically defined to be `default`. I think this 
# is fine to leave as is, as we currently don't allow for
# a user defined namespace through any of our flows.
# 
#========================================================
echo "Configuring cluster namespace"
if kubectl get namespace ${CLUSTER_NAMESPACE}; then
  echo -e "Namespace ${CLUSTER_NAMESPACE} found."
else
  kubectl create namespace ${CLUSTER_NAMESPACE}
  echo -e "Namespace ${CLUSTER_NAMESPACE} created."
fi

# JR Note
#========================================================
# I think we still do this. Nothing changes in this block
#
#========================================================
echo "Configuring cluster role binding"
if kubectl get clusterrolebinding kube-system:default; then
  echo -e "Cluster role binding found."
else
  kubectl create clusterrolebinding kube-system:default --clusterrole=cluster-admin --serviceaccount=kube-system:default
  echo -e "Cluster role binding created."
fi


# JR Note
#========================================================
# NEW INSTALL NOTES
#
# I see the Knative install as being file based vs Helm
# based. More specifically the following:
#
# NOTE - Maybe need to check to see if the "app" is
# already installed before running this command.
#
kubectl apply -f .bluemix/service-knative.yaml
#
# Once the service is applied, we can check to see if it 
# is available as follows (can check Ready state):
#


#Echo url for users
# check the status conditions to see if they're all true 
echo "Checking if application is ready..."
for ITERATION in {1..30}
do
  kubectl get ksvc/${IMAGE_NAME} --output=custom-columns=DOMAIN:.status.conditions[*].status
  SVC_STATUS_READY=$( kubectl get ksvc/${IMAGE_NAME} -o json | jq '.status.conditions[].status|select(. == "True")' )
  echo SVC_STATUS_READY=$SVC_STATUS_READY

  SVC_STATUS_NOT_READY=$( kubectl get ksvc/${IMAGE_NAME} -o json | jq '.status.conditions[].status|select(. == "False")' )
  echo SVC_STATUS_NOT_READY=$SVC_STATUS_NOT_READY

  SVC_STATUS_UNKNOWN=$( kubectl get ksvc/${IMAGE_NAME} -o json | jq '.status.conditions[].status|select(. == "Unknown")' )
  echo SVC_STATUS_UNKNOWN=$SVC_STATUS_UNKNOWN

  if [ \( -n "$SVC_STATUS_NOT_READY" \) -o \( -n "$SVC_STATUS_UNKNOWN" \) ]; then
    sleep 3
    kubectl describe ksvc/${IMAGE_NAME}
  elif [ -n "$SVC_STATUS_READY" ]; then
    echo "Application is ready"
    break
  else
    echo "Application status unknown"
    sleep 3
  fi
done
if [ \( -n "$SVC_STATUS_NOT_READY" \) -o \( -n "$SVC_STATUS_UNKNOWN" \) ]; then
  echo "Application is not ready after waiting maximum time"
  exit 1
fi

# determine app url for polling
kubectl get ksvc/${IMAGE_NAME} -o json | jq '.status.url'
TEMP_URL=$( kubectl get ksvc/${IMAGE_NAME} -o json | jq '.status.url' )
TEMP_URL=${TEMP_URL%\"} # remove end quote
TEMP_URL=${TEMP_URL#\"} # remove beginning quote
export APPLICATION_URL=$TEMP_URL
if [ -n "$APPLICATION_URL" ]; then
  echo "Deploy failed, no URL found for knative service"
  exit 1
fi
echo "Checking for application at $APPLICATION_URL..."
for ITERATION in {1..30}
do
  RESP=$( curl $APPLICATION_URL/health )
  echo "App response: $RESP"
  if [ -n "$RESP" ]; then 
    echo "Application is available"
    echo "=========================================================="
    echo -e "View the application health at: http://$APPLICATION_URL/health"
    exit 0
  else
    echo "No response from app"
  fi
done

echo "Deploy failed, app not found at http://$APPLICATION_URL/health"
exit 1
