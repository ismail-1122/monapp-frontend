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
  - name: docker
    image: docker:24.0.7-cli
    command:
    - cat
    tty: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
"""
    }
  }
  environment {
    IMAGE_TAG = "build-${env.BUILD_NUMBER}"
    DOCKER_IMAGE = "ismailov25/monapp-frontend:${IMAGE_TAG}"
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
        container('docker') {
          script {
            dockerImage = docker.build(env.DOCKER_IMAGE)
            docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-k8s') {
              dockerImage.push()
            }
          }
        }
      }
    }
    stage('Deploy to Kubernetes') {
      steps {
        container('docker') {
          sh """sed -i 's|image: ismailov25/monapp-frontend:.*|image: ismailov25/monapp-frontend:${IMAGE_TAG}|' deployment-frontend.yaml"""
          sh 'kubectl apply -f deployment-frontend.yaml'
          sh 'kubectl apply -f service-frontend.yaml'
        }
      }
    }
  }
} 