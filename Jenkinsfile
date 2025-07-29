pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins: slave
spec:
  securityContext:
    runAsUser: 0
    runAsGroup: 1000
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
  - name: kubectl
    image: lachlanevenson/k8s-kubectl:v1.27.3
    command:
    - cat
    tty: true
    volumeMounts:
    - mountPath: "/home/jenkins/agent"
      name: "workspace-volume"
      readOnly: false
  volumes:
  - name: kaniko-secret
    secret:
      secretName: regcred
      items:
       - key: .dockerconfigjson
         path: config.json
  - emptyDir:
      medium: ""
    name: workspace-volume
"""
        }
    }

    environment {
        IMAGE = "ismailov25/monapp-frontend"
        REGISTRY = "docker.io"
        TAG = "build-${env.BUILD_ID}-${new Random().nextInt(10000)}"
    }

    stages {
        stage('Build Angular App') {
            steps {
                container('node') {
                    sh 'npm install'
                    sh 'npm run build -- --output-path=dist'
                }
            }
        }

        stage('Build & Push Image') {
            steps {
                container('kaniko') {
                    sh 'ls -lh dist/' // Debug : vérifier que le build existe
                    sh """
                        /kaniko/executor \
                          --context=dir://${env.WORKSPACE} \
                          --dockerfile=Dockerfile \
                          --destination=${env.REGISTRY}/${env.IMAGE}:${env.TAG} \
                          --verbosity=info
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh """sed -i 's|image: ismailov25/monapp-frontend:.*|image: ismailov25/monapp-frontend:${TAG}|' deployment-frontend.yaml"""
                    sh 'kubectl apply -f deployment-frontend.yaml'
                    sh 'kubectl apply -f service-frontend.yaml'
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline completed"
        }
    }
} 