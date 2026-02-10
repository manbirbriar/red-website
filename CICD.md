# CI/CD Pipeline Documentation

This document details the complete setup, configuration, and workflow of the CI/CD pipeline for the RED Website. It covers containerization, Jenkins server setup, SonarQube integration, and webhook configuration for automatic triggers.

---

## 1. Containerization Strategy

The application is containerized using **Docker** to ensure consistency across development and production environments.

### The Dockerfile (`docker/Dockerfile.api`)
We use a **Multi-Stage Build** to keep the final image lightweight and secure.

1.  **Build Stage (`maven:3.9.9-eclipse-temurin-21`)**:
    -   Starts with a full JDK and Maven image.
    -   Copies `pom.xml` and downloads dependencies (cached layer).
    -   Copies source code and runs `mvn package` to compile the Spring Boot JAR.
    -   *Crucial*: This stage handles all compilation tools, which are NOT needed in production.

2.  **Runtime Stage (`eclipse-temurin:21-jre`)**:
    -   Starts with a minimal JRE (Java Runtime Environment) image.
    -   Copies **only** the compiled `.jar` file from the Build Stage.
    -   Sets the entrypoint to run the application.
    -   This results in a smaller, safer image with fewer vulnerabilities.

---

## 2. Setting Up Jenkins (First Time Setup)

To replicate this pipeline, you need a running Jenkins instance with Docker and AWS CLI pre-installed.

### Infrastructure Setup
We use **Docker Compose** to run a complete CI environment including Jenkins, SonarQube, and PostgreSQL.

#### Custom Jenkins Image (`docker/Dockerfile.jenkins`)
The standard Jenkins image lacks Docker CLI and AWS CLI, so we build a custom image that includes:
- **Docker CLI**: Installed via official Docker script (for ARM64/Apple Silicon compatibility)
- **AWS CLI v2**: For pushing images to ECR
- **gosu**: For safe user switching while fixing Docker socket permissions
- **Custom entrypoint**: Dynamically adjusts Docker socket group permissions at startup

#### Complete Stack (`docker/docker-compose.ci.yml`)
The compose file defines three services:
1. **jenkins**: Custom build with CLI tools, exposes port 8081
2. **sonarqube**: Community edition, exposes port 9000
3. **db-sonar**: PostgreSQL 15 database for SonarQube data

All services are connected via a shared Docker network (`ci-network`).

**Why a Custom Image?**
- **macOS Compatibility**: The Docker binary on macOS is incompatible with Linux containers. We cannot simply mount `/usr/bin/docker` from the host.
- **Docker Socket Permissions**: On macOS, the Docker socket group ID doesn't match between host and container. The custom entrypoint script dynamically fixes this at startup by adding the jenkins user to the correct group.

### Starting the Environment
1.  **Build and Start All Services**:
    ```bash
    docker compose -f docker/docker-compose.ci.yml up -d --build
    ```
2.  **Access Jenkins**:
    -   URL: `http://localhost:8081`
    -   Get Initial Admin Password:
        ```bash
        docker exec docker-jenkins-1 cat /var/jenkins_home/secrets/initialAdminPassword
        ```

### Required Plugins
Go to **Manage Jenkins > Plugins > Available Plugins** and install:
1.  **Git**: For checking out code from GitHub.
2.  **Pipeline**: Core pipeline functionality.
3.  **SonarQube Scanner**: For integrating code analysis.
4.  **CloudBees AWS Credentials**: For securely handling AWS keys (optional, we use username/password).

### Configuring Credentials
Go to **Manage Jenkins > Credentials > System > Global credentials > Add Credentials**:

1.  **AWS Credentials**:
    -   First, create an IAM user in AWS:
        1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/) → **Users** → **Create user**
        2. Username: `jenkins-ecr-user`
        3. Attach policy: `AmazonEC2ContainerRegistryPowerUser`
        4. Create user → **Security credentials** tab → **Create access key**
        5. Select "Command Line Interface (CLI)" → Create
        6. **Copy both values** (Access Key ID and Secret Access Key)
    -   Then, add to Jenkins:
        -   **Kind**: Username with password.
        -   **Scope**: Global.
        -   **Username**: Your AWS Access Key ID.
        -   **Password**: Your AWS Secret Access Key.
        -   **ID**: `aws-credentials` (Must match `Jenkinsfile`).

2.  **SonarQube Token**:
    -   **Kind**: Secret text.
    -   **Scope**: Global.
    -   **Secret**: The token generated from SonarQube (see SonarQube section).
    -   **ID**: `sonarqube-token` (Must match `Jenkinsfile`).

---

## 3. Setting Up SonarQube

SonarQube is already running as part of the docker-compose stack.

### 1. Access SonarQube
- URL: `http://localhost:9000`
- Default login: `admin` / `admin` (change on first login)

### 2. Create Project & Token
1.  Create a new project manually. Project Key: `red-api`.
2.  Go to **My Account** (top right) > **Security** tab.
3.  Generate a Token:
    -   **Name**: `jenkins`
    -   **Type**: Global Analysis Token
    -   **Expires**: No expiration (or set as needed)
4.  **Copy this token** immediately and save it in Jenkins credentials (ID: `sonarqube-token`).

### 3. Configure SonarQube Webhook to Jenkins
**Critical Step**: SonarQube must notify Jenkins when analysis completes, otherwise `waitForQualityGate` will timeout.

1.  In SonarQube, go to your project > **Project Settings** > **Webhooks**.
2.  Click **Create**.
3.  **Name**: `jenkins`
4.  **URL**: `http://jenkins:8080/sonarqube-webhook/` 
    - Note: Use `jenkins:8080` (internal Docker network name), not `localhost:8081`
    - The trailing slash is **required**
5.  **Secret**: Leave empty
6.  Click **Create**.

### 4. Connect Jenkins to SonarQube
1.  In Jenkins, go to **Manage Jenkins > System**.
2.  Scroll to **SonarQube servers**.
3.  Add Server:
    -   **Name**: `SonarQube` (Must match `Jenkinsfile`).
    -   **Server URL**: `http://sonarqube:9000` (internal Docker network URL).
    -   **Server authentication token**: Select the `sonarqube-token` credential created earlier.

### 5. Add SonarQube Maven Plugin
Ensure your `api/pom.xml` includes the sonar-maven-plugin in the `<build><plugins>` section:
```xml
<plugin>
    <groupId>org.sonarsource.scanner.maven</groupId>
    <artifactId>sonar-maven-plugin</artifactId>
    <version>3.11.0.3922</version>
</plugin>
```

---

## 4. Connecting GitHub to Local Jenkins (Optional - Auto-triggers)

**Note**: This step is only needed if you want GitHub pushes to automatically trigger builds. Otherwise, you can manually click "Build Now" in Jenkins.

To allow GitHub to trigger your local Jenkins server, you must expose it to the internet using **Ngrok**.

### 1. Install & Start Ngrok
1.  Install Ngrok from [ngrok.com](https://ngrok.com/).
2.  Start a tunnel to your Jenkins port (port 8081 in this setup):
    ```bash
    ngrok http 8081
    ```
3.  Copy the Forwarding URL (e.g., `https://1234-56-78-90.ngrok-free.app`).

### 2. Configure GitHub Webhook
1.  Go to your GitHub Repository -> **Settings** -> **Webhooks**.
2.  Click **Add webhook**.
3.  **Payload URL**: `<YOUR_NGROK_URL>/github-webhook/`
    -   *Important*: Don't forget the trailing slash and `github-webhook/` path.
4.  **Content type**: `application/json`.
5.  **Events**: Just the `push` event.
6.  Click **Add webhook**.

### 3. Verify
1.  Push a commit to `main`.
2.  Check the "Recent Deliveries" in GitHub Webhook settings (should be a Green checkmark).
3.  Check Jenkins Dashboard -> The pipeline should automatically start running.

---

## 5. Pipeline Stages Summary

When triggered, the `Jenkinsfile` executes:

1.  **Initialize**: Sets executable permissions on Maven wrapper.
2.  **Build & Test**: Runs `./mvnw clean package` to unit test and compile.
3.  **SonarQube Analysis**: Scans code and uploads report to SonarQube server.
4.  **Quality Gate**:
    -   Waits for SonarQube webhook notification (timeout: 15 minutes).
    -   Checks if quality gate status is "PASS".
    -   *Note*: Currently configured to **ignore failures** (`abortPipeline: false`) for convenience during development (e.g., low code coverage). Set to `true` to enforce strict quality gates.
5.  **Build Docker Image**: Builds the image for `linux/amd64` architecture (required for AWS App Runner).
6.  **Push to ECR**: Authenticates with AWS and uploads the image.
    -   **Prerequisite**: Ensure the ECR repository `red-api` exists in your AWS account (region `us-east-2`). Create it via AWS Console if needed: **ECR > Repositories > Create repository**.
7.  **Deploy**: Confirms success (App Runner handles the actual deployment automatically upon detecting the new ECR image).
