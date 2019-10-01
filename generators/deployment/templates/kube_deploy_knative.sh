#!/bin/bash
#set -x

#View build properties
cat build.properties

echo "Check cluster availability"
IP_ADDR=$(ibmcloud cs workers ${PIPELINE_KUBERNETES_CLUSTER_NAME} | grep normal | head -n 1 | awk '{ print $2 }')
if [ -z $IP_ADDR ]; then
    echo "$PIPELINE_KUBERNETES_CLUSTER_NAME not created or workers not ready"
    exit 1
fi

echo "Configuring cluster namespace"
if kubectl get namespace ${CLUSTER_NAMESPACE}; then
  echo -e "Namespace ${CLUSTER_NAMESPACE} found."
else
  kubectl create namespace ${CLUSTER_NAMESPACE}
  echo -e "Namespace ${CLUSTER_NAMESPACE} created."
fi

echo "Configuring cluster role binding"
if kubectl get clusterrolebinding kube-system:default; then
  echo -e "Cluster role binding found."
else
  kubectl create clusterrolebinding kube-system:default --clusterrole=cluster-admin --serviceaccount=kube-system:default
  echo -e "Cluster role binding created."
fi


# Deploy the most recent revision of the specified image
sed -e "s/image: REGISTRY_URL/image: ${REGISTRY_URL}/g" .bluemix/service-knative.yaml | 
sed -e "s/BUILD_NUMBER/${BUILD_NUMBER}/g" | 
kubectl apply -f -


echo "Checking if application is ready..."
for ITERATION in {1..30}
do
  sleep 3

  kubectl get ksvc/${IMAGE_NAME} --output=custom-columns=DOMAIN:.status.conditions[*].status
  SVC_STATUS_READY=$( kubectl get ksvc/${IMAGE_NAME} -o json | jq '.status?.conditions[]?.status?|select(. == "True")' )
  echo SVC_STATUS_READY=$SVC_STATUS_READY

  SVC_STATUS_NOT_READY=$( kubectl get ksvc/${IMAGE_NAME} -o json | jq '.status?.conditions[]?.status?|select(. == "False")' )
  echo SVC_STATUS_NOT_READY=$SVC_STATUS_NOT_READY

  SVC_STATUS_UNKNOWN=$( kubectl get ksvc/${IMAGE_NAME} -o json | jq '.status?.conditions[]?.status?|select(. == "Unknown")' )
  echo SVC_STATUS_UNKNOWN=$SVC_STATUS_UNKNOWN

  if [ \( -n "$SVC_STATUS_NOT_READY" \) -o \( -n "$SVC_STATUS_UNKNOWN" \) ]; then
    echo "Application not ready, retrying"
  elif [ -n "$SVC_STATUS_READY" ]; then
    echo "Application is ready"
    break
  else
    echo "Application status unknown, retrying"
  fi
done
echo "Application service details:"
kubectl describe ksvc/${IMAGE_NAME}
if [ \( -n "$SVC_STATUS_NOT_READY" \) -o \( -n "$SVC_STATUS_UNKNOWN" \) ]; then
  echo "Application is not ready after waiting maximum time"
  exit 1
fi

# Determine app url for polling from knative service
TEMP_URL=$( kubectl get ksvc/${IMAGE_NAME} -o json | jq '.status.url' )
echo "Application status URL: $TEMP_URL"
TEMP_URL=${TEMP_URL%\"} # remove end quote
TEMP_URL=${TEMP_URL#\"} # remove beginning quote
export APPLICATION_URL=$TEMP_URL
if [ -z "$APPLICATION_URL" ]; then
  echo "Deploy failed, no URL found for knative service"
  exit 1
fi
echo "Application is available"
echo "=========================================================="
echo -e "View the application health at: $APPLICATION_URL/health"
