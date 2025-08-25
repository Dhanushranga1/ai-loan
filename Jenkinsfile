pipeline {
    agent any

    environment {
        // Registry configuration - update with your registry
        REGISTRY = 'docker.io'
        REGISTRY_USER = 'your-dockerhub-username'  // Replace with actual username
        IMAGE_NAME = 'ai-loan-approval'

        // Git commit info
        GIT_COMMIT_SHORT = "${env.GIT_COMMIT.take(7)}"
        IMAGE_TAG = "${env.GIT_COMMIT.take(7)}"
        FULL_IMAGE_NAME = "${REGISTRY}/${REGISTRY_USER}/${IMAGE_NAME}"

        // VM deployment configuration
        VM_HOST = 'your-vm-ip'  // Replace with actual VM IP
        VM_USER = 'ubuntu'      // Replace with actual VM user
        DEPLOY_SCRIPT = '/opt/ai-loan-approval/deploy.sh'

        // Node.js configuration
        NODE_VERSION = '20'
        NEXT_TELEMETRY_DISABLED = '1'
    }

    options {
        // Keep builds for 30 days, max 10 builds
        buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '10'))

        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')

        // Skip default checkout
        skipDefaultCheckout()
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out source code...'
                checkout scm

                script {
                    // Get commit info for build metadata
                    env.GIT_COMMIT_MSG = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()

                    env.GIT_AUTHOR = sh(
                        script: 'git log -1 --pretty=%an',
                        returnStdout: true
                    ).trim()
                }

                echo "📝 Commit: ${env.GIT_COMMIT_SHORT} by ${env.GIT_AUTHOR}"
                echo "💬 Message: ${env.GIT_COMMIT_MSG}"
            }
        }

        stage('Setup Node.js') {
            steps {
                echo '🔧 Setting up Node.js environment...'

                script {
                    // Check Node.js version
                    sh 'node --version || echo "Node.js not found"'
                    sh 'npm --version || echo "npm not found"'

                    // Enable corepack for pnpm support
                    sh 'corepack enable || echo "corepack not available, using npm"'
                    sh 'pnpm --version || echo "pnpm not available, will use npm"'
                }
            }
        }

        stage('Cache Dependencies') {
            steps {
                echo '📦 Setting up dependency cache...'

                script {
                    // Cache node_modules and pnpm store
                    if (fileExists('pnpm-lock.yaml')) {
                        echo 'Using pnpm with cache'
                        cache(maxCacheSize: 1000, caches: [
                            arbitraryFileCache(
                                path: 'node_modules',
                                fingerprint: fingerprint('pnpm-lock.yaml')
                            ),
                            arbitraryFileCache(
                                path: '.pnpm-store',
                                fingerprint: fingerprint('pnpm-lock.yaml')
                            )
                        ]) {
                            sh 'pnpm config set store-dir .pnpm-store'
                        }
                    } else if (fileExists('package-lock.json')) {
                        echo 'Using npm with cache'
                        cache(maxCacheSize: 1000, caches: [
                            arbitraryFileCache(
                                path: 'node_modules',
                                fingerprint: fingerprint('package-lock.json')
                            )
                        ]) {
                            // Cache setup for npm
                            sh 'echo "npm cache configured"'
                        }
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📚 Installing dependencies...'

                script {
                    if (fileExists('pnpm-lock.yaml')) {
                        sh 'pnpm install --frozen-lockfile'
                    } else if (fileExists('package-lock.json')) {
                        sh 'npm ci'
                    } else {
                        sh 'npm install'
                    }
                }
            }
        }

        stage('Lint & Type Check') {
            steps {
                echo '🔍 Running linting and type checks...'

                parallel(
                    "Lint": {
                        script {
                            if (fileExists('pnpm-lock.yaml')) {
                                sh 'pnpm lint'
                            } else {
                                sh 'npm run lint'
                            }
                        }
                    },
                    "Type Check": {
                        script {
                            if (fileExists('pnpm-lock.yaml')) {
                                sh 'pnpm type-check'
                            } else {
                                sh 'npm run type-check'
                            }
                        }
                    }
                )
            }
        }

        stage('Test') {
            steps {
                echo '🧪 Running tests...'

                script {
                    if (fileExists('pnpm-lock.yaml')) {
                        sh 'pnpm test --reporter=junit'
                    } else {
                        sh 'npm test -- --reporter=junit'
                    }
                }
            }

            post {
                always {
                    // Archive test results
                    junit(
                        testResults: '**/junit*.xml',
                        allowEmptyResults: true,
                        skipPublishingChecks: true
                    )
                }
            }
        }

        stage('Build Application') {
            steps {
                echo '🏗️ Building Next.js application...'

                script {
                    if (fileExists('pnpm-lock.yaml')) {
                        sh 'pnpm build'
                    } else {
                        sh 'npm run build'
                    }
                }

                // Verify build output
                sh 'ls -la .next/'
                sh 'ls -la .next/standalone/ || echo "Standalone output not found"'
            }
        }

        stage('Build & Push Docker Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    changeRequest()
                }
            }

            steps {
                echo '🐳 Building and pushing Docker image...'

                script {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'dockerhub-creds',
                            usernameVariable: 'DOCKER_USER',
                            passwordVariable: 'DOCKER_PASS'
                        )
                    ]) {
                        sh '''
                            echo "Logging in to Docker registry..."
                            echo "$DOCKER_PASS" | docker login $REGISTRY -u "$DOCKER_USER" --password-stdin

                            echo "Building Docker image..."
                            docker build -t $FULL_IMAGE_NAME:$IMAGE_TAG -t $FULL_IMAGE_NAME:latest .

                            echo "Pushing images to registry..."
                            docker push $FULL_IMAGE_NAME:$IMAGE_TAG
                            docker push $FULL_IMAGE_NAME:latest

                            echo "Images pushed successfully:"
                            echo "  - $FULL_IMAGE_NAME:$IMAGE_TAG"
                            echo "  - $FULL_IMAGE_NAME:latest"
                        '''
                    }
                }
            }

            post {
                always {
                    // Clean up local images to save space
                    sh '''
                        docker rmi $FULL_IMAGE_NAME:$IMAGE_TAG || true
                        docker rmi $FULL_IMAGE_NAME:latest || true
                        docker system prune -f || true
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }

            steps {
                echo '🚀 Deploying to production VM...'

                script {
                    sshagent(credentials: ['vm-ssh-key']) {
                        sh '''
                            echo "Deploying image $FULL_IMAGE_NAME:$IMAGE_TAG to VM..."

                            ssh -o StrictHostKeyChecking=no $VM_USER@$VM_HOST "
                                set -e
                                echo 'Running deployment script...'
                                sudo $DEPLOY_SCRIPT $FULL_IMAGE_NAME:$IMAGE_TAG
                                echo 'Deployment completed successfully!'

                                echo 'Container status:'
                                docker ps --filter name=ai-loan-approval --format 'table {{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}'
                            "
                        '''
                    }
                }
            }
        }

        stage('Post-Deploy Verification') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }

            steps {
                echo '✅ Verifying deployment...'

                script {
                    sshagent(credentials: ['vm-ssh-key']) {
                        sh '''
                            echo "Running post-deployment verification..."

                            ssh -o StrictHostKeyChecking=no $VM_USER@$VM_HOST "
                                set -e

                                echo 'Checking application health...'
                                curl -f http://localhost:3000/api/health

                                echo 'Health check passed!'
                                echo 'Application is running successfully.'
                            "
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up workspace...'

            // Archive build artifacts
            archiveArtifacts(
                artifacts: '.next/**/*',
                allowEmptyArchive: true,
                fingerprint: true
            )

            // Clean workspace
            cleanWs()
        }

        success {
            echo '✅ Pipeline completed successfully!'

            script {
                if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                    echo """
                    🎉 Deployment Summary:

                    📦 Image: ${env.FULL_IMAGE_NAME}:${env.IMAGE_TAG}
                    🔧 Commit: ${env.GIT_COMMIT_SHORT}
                    👤 Author: ${env.GIT_AUTHOR}
                    💬 Message: ${env.GIT_COMMIT_MSG}
                    🚀 Deployed to: ${env.VM_HOST}

                    Application is now available at: http://${env.VM_HOST}:3000
                    Health endpoint: http://${env.VM_HOST}:3000/api/health
                    """
                }
            }
        }

        failure {
            echo '❌ Pipeline failed!'

            script {
                // In a real environment, you might want to send notifications
                echo """
                🚨 Build Failure Alert:

                📦 Project: ${env.JOB_NAME}
                🔧 Build: #${env.BUILD_NUMBER}
                🔧 Commit: ${env.GIT_COMMIT_SHORT}
                👤 Author: ${env.GIT_AUTHOR}
                💬 Message: ${env.GIT_COMMIT_MSG}

                Check the build logs for details.
                """
            }
        }

        unstable {
            echo '⚠️ Pipeline completed with warnings!'
        }
    }
}
