#!/bin/bash
#
# Docker entrypoint for nshmp-haz-ws:
#   - Downloads nshmp-haz and all models
#   - Builds nshmp-haz-ws
#   - Deploys nshmp-haz-ws
####

set -o errexit;
set -o errtrace;

readonly LOG_FILE="/var/log/docker-entrypoint-haz-ws.log";

# Docker usage
readonly USAGE="
  docker run -p <PORT>:8080 -d usgs/nshmp-haz-ws
";

####
# Build and deploy nshmp-haz-ws.
# Globals:
#   (string) LOG_FILE - The log file
#   (string) TOMCAT_WEBAPPS - Path to Tomcat webapps directory
#   (string) WAR_PATH - Path to nshmp-haz-ws.war
# Arguments:
#   None
# Returns:
#   None
####
main() {
  # Set trap for uncaught errors
  trap 'error_exit "${BASH_COMMAND}" "$(< ${LOG_FILE})" "${USAGE}"' ERR;
  
  # Download repositories
  download_repos;

  # Build nshmp-haz-ws
  ./gradlew assemble 2> ${LOG_FILE};

  # Move war file
  mv "${WAR_PATH}" "${TOMCAT_WEBAPPS}" 2> ${LOG_FILE};

  # Run Tomcat
  catalina.sh run 1> ${LOG_FILE};
}

####
# Download a repository from Github.
# Globals:
#   (string) CENTOS_LOG_FILE - The log file
# Arguments:
#   (string) user - The Github user
#   (string) repo - The project to download
#   (string) version - The version to download
#   (string) directory - The direcotry name for repo download
# Returns:
#   None
####
download_repo() {
  local usage="download_repo <user> <repo> <version>";

  local user=${1};
  local repo=${2};
  local version=${3};
  local directory=${4};
  local url="https://github.com/${user}/${repo}/archive/${version}.tar.gz";

  if [ "${version}" == "null" ]; then
    printf "\n Skipping download of [%s/%s]\n" "${user}" "${repo}";
    return;
  fi

  printf "\n Downloading [%s] \n\n" "${url}";

  if [ -z "${directory}" ]; then
    directory=${repo};
  fi

  curl -L "${url}" | tar -xz 2> "${LOG_FILE}" || \
      error_exit "Could not download [${url}]" "$(< "${LOG_FILE}")" "${usage}";

  mv "${repo}-${version#v*}" "${directory}";
}

####
# Download nshmp-haz and all models.
# Globals:
#   (string) HOME - app home 
#   (string) LOG_FILE - The log file
#   (string) NSHM_AK_2007_VERSION - nshm-ak-2007 repository version
#   (string) NSHM_COUS_2008_VERSION - nshm-cous-2008 repository version
#   (string) NSHM_COUS_2014_VERSION - nshm-cous-2014 repository version
#   (string) NSHM_COUS_2014B_VERSION - nshm-cous-2014b repository version
#   (string) NSHM_COUS_2018_VERSION - nshm-cous-2018 repository version
#   (string) NSHMP_HAZ_VERSION - nshmp-haz repository version
#   (string) WORKDIR - The Docker working directory
# Arguments:
#   None
# Returns:
#   None
####
download_repos() {
  pushd .. > /dev/null 2>&1;

  # Download nshmp-haz
  download_repo "usgs" "nshmp-haz" "${NSHMP_HAZ_VERSION}";

  # Download nshm-ak-2007
  download_repo "usgs" "nshm-ak-2007" "${NSHM_AK_2007_VERSION}";

  # Download nshm-cous-2008
  download_repo "usgs" "nshm-cous-2008" "${NSHM_COUS_2008_VERSION}";

  # Download nshm-cous-2014
  download_repo "usgs" "nshm-cous-2014" "${NSHM_COUS_2014_VERSION}";

  # Download nshm-cous-2014
  download_repo "usgs" "nshm-cous-2014" "${NSHM_COUS_2014B_VERSION}" "nshm-cous-2014b";

  # Download nshm-cous-2018
  download_repo "usgs" "nshm-cous-2018" "${NSHM_COUS_2018_VERSION}";

  popd > /dev/null 2>&1;
}

####
# Exit script with error.
# Globals:
#   None
# Arguments:
#   (string) err - The error message
#   (string) logs - The log for the error
#   (string) usage - The Docker usage
# Returns:
#   None
####
error_exit() {
  local err="${1}";
  local logs="${2}";
  local usage="${3}";

  local message="
    Error:
    ${err}
    ----------
    Logs:
    ${logs}
    ----------
    Usage:
    ${usage}
  ";

  echo "${message}";

  exit 0;
}

####
# Run main
####
main "$@";
