################################
# Dockerfile for nshmp-haz-ws
################################

# Project
ARG project=nshmp-haz-ws

# Builder image working directory
ARG builder_workdir=/app/${project}

# Path to WAR file in builder image
ARG war_path=${builder_workdir}/build/libs/${project}.war

####
# Builder Image: Java 8
#   - Install git
#   - Download repositories (docker.sh)
#   - Build nshmp-haz-ws
####
FROM openjdk:8-alpine as builder

# Get builder workdir
ARG builder_workdir

# Repository version
ARG NSHMP_HAZ_VERSION=master
ARG NSHM_COUS_2018_VERSION=master
ARG NSHM_COUS_2014_VERSION=master
ARG NSHM_COUS_2008_VERSION=master
ARG NSHM_AK_2007_VERSION=master

# Set working directory
WORKDIR ${builder_workdir} 

# Copy project over to container
COPY . ${builder_workdir}/. 

# Install curl, git, bash
RUN apk add --no-cache git curl bash

# Download repositories
RUN cd .. && bash ${builder_workdir}/docker.sh

# Build nshmp-haz-ws
RUN ./gradlew assemble

####
# Application Image: Tomcat
#   - Copy WAR file from builder image
#   - Run Tomcat
####
FROM tomcat:8-alpine

# Set author
LABEL maintainer="Peter Powers <pmpowers@usgs.gov>"

# Get WAR path
ARG war_path

# Copy WAR file from builder image
COPY --from=builder ${war_path} ${CATALINA_HOME}/webapps/.

# Set Java memory
ENV JAVA_OPTS -Xms1g -Xmx4g 

# Expose port
EXPOSE 8080

# Run Tomcat
ENTRYPOINT ${CATALINA_HOME}/bin/catalina.sh run
