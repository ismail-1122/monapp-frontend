pipeline {
  agent {
    kubernetes {
      yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: node:20
    command:
    - cat
    tty: true
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command:
    - /busybox/cat
    tty: true
    volumeMounts:
    - name: kaniko-secret
      mountPath: /kaniko/.docker
  volumes:
  - name: kaniko-secret
    secret:
      secretName: regcred
      items:
       - key: .dockerconfigjson
         path: config.json
"""
    }
  }
  environment {
    IMAGE_TAG = "build-${env.BUILD_NUMBER}"
    DOCKER_IMAGE = "ismailov25/monapp-frontend:${IMAGE_TAG}"
    REGISTRY = "docker.io"
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Install') {
      steps {
        container('node') {
          sh 'npm install'
        }
      }
    }
    stage('Build') {
      steps {
        container('node') {
          sh 'npm run build -- --output-path=dist'
        }
      }
    }
    stage('Docker Build & Push') {
      steps {
        container('kaniko') {
          sh """
            /kaniko/executor \
              --context=${env.WORKSPACE} \
              --dockerfile=${env.WORKSPACE}/Dockerfile \
              --destination=${REGISTRY}/${DOCKER_IMAGE} \
              --verbosity=info
          """
        }
      }
    }
    stage('Deploy to Kubernetes') {
      steps {
        container('kaniko') {
          sh """sed -i 's|image: ismailov25/monapp-frontend:.*|image: ismailov25/monapp-frontend:${IMAGE_TAG}|' deployment-frontend.yaml"""
          sh 'kubectl apply -f deployment-frontend.yaml'
          sh 'kubectl apply -f service-frontend.yaml'
        }
      }
    }
  }
} 