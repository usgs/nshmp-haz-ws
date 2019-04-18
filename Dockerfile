################################
# Dockerfile for nshmp-haz-ws
#
# Note: Models load as requested. While all supported models are
# available, requesting them all will eventually result in an
# OutOfMemoryError. Increase -Xmx to -Xmx16g or -Xmx24g, if available.
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
FROM openjdk:8 as builder

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
RUN apt-get install -y git curl bash

# Download repositories
RUN cd .. && bash ${builder_workdir}/docker.sh

# Build nshmp-haz-ws
RUN ./gradlew assemble

####
# Application Image: usgs/centos
#   - Install Java 8 and Tomcat
#   - Copy WAR file from builder image
#   - Run Tomcat
####
FROM usgs/centos

# Set author
LABEL maintainer="Peter Powers <pmpowers@usgs.gov>"

# Tomcat home
ENV CATALINA_HOME "/usr/local/tomcat"

# Tomcat version to download
ARG tomcat_major=8
ARG tomcat_version=8.5.39
ARG tomcat_source=http://archive.apache.org/dist/tomcat

# Install Java 8 and Tomcat 8
RUN yum install -y java-1.8.0-openjdk-devel \
  && curl -L ${tomcat_source}/tomcat-${tomcat_major}/v${tomcat_version}/bin/apache-tomcat-${tomcat_version}.tar.gz | tar -xz \
  && mv apache-tomcat-${tomcat_version} ${CATALINA_HOME}

# Get WAR path
ARG war_path

# Copy WAR file from builder image
COPY --from=builder ${war_path} ${CATALINA_HOME}/webapps/.

# Set Java memory
ENV JAVA_OPTS -Xms1g -Xmx8g

# Expose port
EXPOSE 8080

# Run Tomcat
ENTRYPOINT ${CATALINA_HOME}/bin/catalina.sh run
