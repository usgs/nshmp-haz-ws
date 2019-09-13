####
# Dockerfile for nshmp-haz-ws
#
# Usage:
#   docker run -p <PORT>:8080 -d usgs/nshmp-haz-ws
#
# Note: Models load as requested. While all supported models are
# available, requesting them all will eventually result in an
# OutOfMemoryError. Increase -Xmx to -Xmx16g or -Xmx24g, if available.
####

####
# Application Image: usgsnshmp/tomcat:8.5-jre8
#   - Download nshmp-haz and models
#   - Build nshmp-haz-ws
#   - Deploy nshmp-haz-ws 
####
FROM usgsnshmp/tomcat:8.5-jre8 

# Set author
LABEL maintainer="Peter Powers <pmpowers@usgs.gov>"

# Project name
ENV PROJECT=nshmp-haz-ws

# Set home
ENV HOME=/app

# Builder image working directory
ENV WORKDIR=${HOME}/${PROJECT}

# Path to WAR file in builder image
ENV WAR_PATH=${WORKDIR}/build/libs/${PROJECT}.war

# Set working directory
WORKDIR ${WORKDIR} 

# Copy project over to container
COPY . ${WORKDIR}/.

# Install git
RUN yum install git -y

# Environment for production or developmental models
# Values: PROD || DEV
ENV MODEL_ENV=PROD

# Repository version
ENV NSHMP_HAZ_VERSION=master
ENV NSHM_COUS_2018_VERSION=master
ENV NSHM_COUS_2014_VERSION=v4.1.4
ENV NSHM_COUS_2014B_VERSION=master
ENV NSHM_COUS_2008_VERSION=master
ENV NSHM_AK_2007_VERSION=master
ENV NSHM_HI_2020_VERSION=master

# Set Java memory
ENV JAVA_OPTS -Xms8g -Xmx8g

# Run nshmp-haz-ws
ENTRYPOINT [ "bash", "docker-entrypoint.sh" ]
