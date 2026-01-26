pipeline {
    agent any

    environment {
        // AWS & Project Configuration
        AWS_ACCOUNT_ID     = '791296380444'
        AWS_DEFAULT_REGION = 'us-east-2'
        ECR_REPO_NAME      = 'red-api'
        ECR_REGISTRY       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
        IMAGE_TAG          = 'latest' 
        
        // Jenkins Credentials IDs (You must configure these in Jenkins)
        AWS_CREDENTIALS_ID = 'aws-credentials' // ID for AWS Access Key and Secret
        SONAR_TOKEN_ID     = 'sonarqube-token' // ID for SonarQube Authentication Token
    }

    stages {
        stage('Initialize') {
            steps {
                script {
                    echo 'Determining build environment...'
                    // Ensure Maven wrapper is executable
                    sh 'chmod +x api/mvnw'
                }
            }
        }

        stage('Build & Test') {
            steps {
                dir('api') {
                    script {
                        echo 'Compiling and Running Tests...'
                        // 'package' goal runs 'test' goal automatically
                        sh './mvnw clean package' 
                    }
                    // Publish JUnit test results to Jenkins UI
                    junit 'target/surefire-reports/*.xml'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                dir('api') {
                    script {
                        // Requires "SonarQube Scanner" plugin configuration in Jenkins 
                        // with the server name set to "SonarQube"
                        withSonarQubeEnv('SonarQube') {
                             sh './mvnw sonar:sonar -Dsonar.projectKey=red-api'
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                // Wait for analysis to complete and pass the quality gate
                timeout(time: 15, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building Docker Image...'
                    // Build context is root (.) 
                    sh "docker build -t ${ECR_REGISTRY}/${ECR_REPO_NAME}:${IMAGE_TAG} -f docker/Dockerfile.api ."
                }
            }
        }

        stage('Push to AWS ECR') {
            steps {
                script {
                    echo 'Pushing to ECR...'
                    withCredentials([usernamePassword(credentialsId: AWS_CREDENTIALS_ID, passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                        // Login to ECR
                        sh "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
                        // Push Image
                        sh "docker push ${ECR_REGISTRY}/${ECR_REPO_NAME}:${IMAGE_TAG}"
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo "Deployment: Image pushed to ECR."
                    echo "Since App Runner Auto-Deployments are enabled, the new image will be deployed automatically."
                }
            }
        }
    }

    post {
        always {
            // Clean up workspace to save disk space
            cleanWs()
        }
        success {
            echo 'Pipeline executed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
