FROM debian:stretch

ENV SCRIPTS_FOLDER /docker
ENV APP_SOURCE_FOLDER /opt/src
ENV APP_BUNDLE_FOLDER /opt/bundle

# Install dependencies, based on https://github.com/jshimko/meteor-launchpad/blob/master/scripts/install-deps.sh (only the parts we plan to use)
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
	apt-get install --assume-yes apt-transport-https ca-certificates procps && \
	apt-get install --assume-yes --no-install-recommends build-essential bzip2 curl git libarchive-tools python 

# Install Meteor
RUN curl https://install.meteor.com/?release=$METEOR_VERSION --output /tmp/install-meteor.sh && \
	# Replace tar with bsdtar in the install script; https://github.com/jshimko/meteor-launchpad/issues/39 and https://github.com/intel/lkp-tests/pull/51
	sed --in-place "s/tar -xzf.*/bsdtar -xf \"\$TARBALL_FILE\" -C \"\$INSTALL_TMPDIR\"/g" /tmp/install-meteor.sh && \
	# Install Meteor
	printf "\n[-] Installing Meteor $METEOR_VERSION...\n\n" && \
	sh /tmp/install-meteor.sh

# Add a meteor user. We will run meteor processes as this user
RUN groupadd -r meteor && useradd -m --no-log-init -r -g meteor meteor
WORKDIR /opt/app

# Make sure the .meteor/local directory exists and is owned by the
# meteor user. We will mount a data volume over this via the docker-compose
# file.
RUN mkdir -p /opt/app/.meteor/local && chown -R meteor:meteor /opt/app
USER meteor
ENTRYPOINT ["meteor", "--settings", "./settings.json", "--port", "3000"]
