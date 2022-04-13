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

ARG FROM_IMAGE=usgs/amazoncorretto:8

####
# Build nshmp-haz-ws
#### 
FROM ${FROM_IMAGE}

LABEL maintainer="Peter Powers <pmpowers@usgs.gov>"

# Don't throttle IP address in Docker container
ENV CATALINA_OPTS="${CATALINA_OPTS} -DthrottleIp=false"
# Java opts
ENV JAVA_OPTS -Xms8g -Xmx8g

# Repository version
ENV NSHMP_HAZ_VERSION=master
ENV NSHM_COUS_2018_VERSION=master
ENV NSHM_COUS_2014_VERSION=v4.1.4
ENV NSHM_COUS_2014B_VERSION=master
ENV NSHM_COUS_2008_VERSION=master
ENV NSHM_AK_2007_VERSION=master
ENV NSHM_HI_2020_VERSION=master

ENV CATALINA_HOME /usr/local/tomcat
ENV LANG en_US.UTF-8
ENV PATH ${CATALINA_HOME}/bin:${PATH}
ENV TOMCAT_SOURCE http://archive.apache.org/dist/tomcat
ENV TOMCAT_WEBAPPS ${CATALINA_HOME}/webapps
ENV TOMCAT_URL=${TOMCAT_SOURCE}/tomcat-8/v8.5.40/bin/apache-tomcat-8.5.40.tar.gz

# Install Tomcat
WORKDIR ${CATALINA_HOME}
RUN curl -L ${TOMCAT_URL} | tar -xz --strip-components=1

ENV WORKDIR=/app
ENV WAR_PATH=${WORKDIR}/build/libs/nshmp-haz-ws.war

WORKDIR ${WORKDIR} 
COPY . ${WORKDIR}/.

# Build and run nshmp-haz-ws
ENTRYPOINT [ "bash", "docker-entrypoint.sh" ]
